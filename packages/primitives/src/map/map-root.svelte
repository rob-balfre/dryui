<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setMapCtx } from './context.svelte.js';
	import { onDestroy } from 'svelte';
	import type {
		LngLat,
		MapInstance,
		MapLibrary,
		MapMarkerInstance,
		MapOptions,
		MarkerOptions
	} from './types.js';

	type WindowWithMapLibs = Window & { maplibregl?: MapLibrary; mapboxgl?: MapLibrary };

	interface Props extends HTMLAttributes<HTMLDivElement> {
		center?: LngLat;
		zoom?: number;
		minZoom?: number;
		maxZoom?: number;
		mapStyle?: string;
		createMap?: (container: HTMLDivElement, options: MapOptions) => MapInstance;
		children?: Snippet;
	}

	let {
		center = [0, 0],
		zoom = 2,
		minZoom,
		maxZoom,
		mapStyle,
		createMap,
		class: className,
		children,
		...rest
	}: Props = $props();

	let containerEl = $state<HTMLDivElement>();
	let mapInstance = $state<MapInstance | null>(null);
	let mapLib = $state<MapLibrary | null>(null);
	let loaded = $state(false);
	let error = $state<string | null>(null);
	let markers = new Map<string, MapMarkerInstance>();

	const ctx = setMapCtx({
		get map() {
			return mapInstance;
		},
		get lib() {
			return mapLib;
		},
		get container() {
			return containerEl ?? null;
		},
		get loaded() {
			return loaded;
		},
		addMarker(id: string, position: LngLat, element?: HTMLElement) {
			if (!mapInstance || !mapLib) return;
			removeMarkerById(id);
			try {
				const markerOptions: MarkerOptions = {};
				if (element) {
					markerOptions.element = element;
				}
				const marker = new mapLib.Marker(markerOptions).setLngLat(position).addTo(mapInstance);
				markers.set(id, marker);
			} catch {
				// intentional — map remains usable without the marker
			}
		},
		removeMarker(id: string) {
			removeMarkerById(id);
		},
		flyTo(center: LngLat, flyZoom?: number) {
			if (!mapInstance) return;
			const opts: { center: LngLat; zoom?: number } = { center };
			if (flyZoom !== undefined) opts.zoom = flyZoom;
			mapInstance.flyTo(opts);
		}
	});

	function removeMarkerById(id: string) {
		const existing = markers.get(id);
		if (existing) {
			existing.remove();
			markers.delete(id);
		}
	}

	function getGlobalLib(): MapLibrary | null {
		if (typeof window === 'undefined') return null;
		const win = window as WindowWithMapLibs;
		return win.maplibregl ?? win.mapboxgl ?? null;
	}

	async function initMap(container: HTMLDivElement) {
		const options: MapOptions = {
			container,
			center,
			zoom
		};
		if (minZoom !== undefined) options.minZoom = minZoom;
		if (maxZoom !== undefined) options.maxZoom = maxZoom;
		if (mapStyle) options.style = mapStyle;

		if (createMap) {
			try {
				mapInstance = createMap(container, options);
			} catch (e) {
				error = `Map creation failed: ${e instanceof Error ? e.message : String(e)}`;
				return;
			}
			// Resolve lib from globals when using createMap
			mapLib = getGlobalLib();
		} else {
			// Auto-detect map library
			let lib: MapLibrary | null = getGlobalLib();

			// Try dynamic import (use variable to prevent bundler from resolving)
			if (!lib) {
				const maplibreId = 'maplibre-gl';
				const mapboxId = 'mapbox-gl';
				try {
					const mod = (await import(/* @vite-ignore */ maplibreId)) as { default?: MapLibrary };
					lib = mod.default ?? (mod as unknown as MapLibrary);
				} catch {
					try {
						const mod = (await import(/* @vite-ignore */ mapboxId)) as { default?: MapLibrary };
						lib = mod.default ?? (mod as unknown as MapLibrary);
					} catch {
						error =
							'No map library found. Install maplibre-gl or mapbox-gl, or provide a createMap prop.';
						return;
					}
				}
			}

			mapLib = lib;

			try {
				mapInstance = new lib.Map(options);
			} catch (e) {
				error = `Map creation failed: ${e instanceof Error ? e.message : String(e)}`;
				return;
			}
		}

		if (mapInstance) {
			mapInstance.on('load', () => {
				loaded = true;
			});

			// Some maps fire 'load' synchronously or have already loaded
			if (mapInstance.loaded?.()) {
				loaded = true;
			}
		}
	}

	$effect(() => {
		if (containerEl && !mapInstance && !error) {
			initMap(containerEl);
		}
	});

	// React to center changes
	$effect(() => {
		if (mapInstance && loaded) {
			const currentCenter = mapInstance.getCenter?.();
			if (currentCenter) {
				const [lng, lat] = center;
				if (
					Math.abs(currentCenter.lng - lng) > 0.0001 ||
					Math.abs(currentCenter.lat - lat) > 0.0001
				) {
					mapInstance.setCenter(center);
				}
			}
		}
	});

	// React to zoom changes
	$effect(() => {
		if (mapInstance && loaded) {
			const currentZoom = mapInstance.getZoom?.();
			if (currentZoom !== undefined && Math.abs(currentZoom - zoom) > 0.01) {
				mapInstance.setZoom(zoom);
			}
		}
	});

	onDestroy(() => {
		for (const marker of markers.values()) {
			marker.remove();
		}
		markers.clear();
		if (mapInstance) {
			mapInstance.remove();
			mapInstance = null;
		}
	});
</script>

{#if error}
	<div class={className} data-part="map-root" {...rest}>
		<div data-part="map-error" class="map-error">
			{error}
		</div>
	</div>
{:else}
	<div bind:this={containerEl} class={className} data-part="map-root" {...rest}></div>
	{#if children}
		{@render children()}
	{/if}
{/if}

<style>
	.map-error {
		display: grid;
		place-items: center;
		block-size: 100%;
		padding: 1rem;
		text-align: center;
		color: inherit;
		opacity: 0.6;
	}
</style>
