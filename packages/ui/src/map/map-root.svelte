<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import { setMapCtx } from './context.svelte.js';
	import type {
		LngLat,
		MapInstance,
		MapLibrary,
		MapMarkerInstance,
		MapOptions,
		MarkerOptions
	} from '@dryui/primitives';

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
				// intentional
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
			mapLib = getGlobalLib();
		} else {
			let lib: MapLibrary | null = getGlobalLib();

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
	<div class={className} data-part="map-root" data-map-root {...rest}>
		<div data-part="map-error">
			{error}
		</div>
	</div>
{:else}
	<div bind:this={containerEl} class={className} data-part="map-root" data-map-root {...rest}></div>
	{#if children}
		{@render children()}
	{/if}
{/if}

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-map-root] {
		--dry-map-radius: var(--dry-radius-lg, 0.5rem);
		--dry-map-border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);

		display: grid;
		position: relative;
		border-radius: var(--dry-map-radius);
		border: var(--dry-map-border);
		overflow: hidden;
		height: 400px;
	}

	[data-map-root] [data-map-mapboxgl]-canvas,
	[data-map-root] [data-map-maplibregl]-canvas {
		border-radius: var(--dry-map-radius);
	}

	[data-map-marker] {
		cursor: pointer;
	}

	[data-map-marker] [data-part='marker-content'] {
		background: var(--dry-color-bg-raised, #ffffff);
		border-radius: var(--dry-radius-md, 0.375rem);
		box-shadow: var(--dry-shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
		padding: var(--dry-space-2, 0.5rem);
	}

	[data-map-popup] {
		display: grid;
		grid-template-columns: minmax(0, 20rem);
	}

	[data-map-popup] [data-map-mapboxgl]-popup-content,
	[data-map-popup] [data-map-maplibregl]-popup-content {
		background: var(--dry-color-bg-raised, #ffffff);
		border-radius: var(--dry-radius-lg, 0.5rem);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-4, 1rem);
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
	}

	[data-theme='dark'] [data-map-popup] [data-map-mapboxgl]-popup-content,
	[data-theme='dark'] [data-map-popup] [data-map-maplibregl]-popup-content {
		background: var(--dry-color-bg-raised, #1e1e2e);
	}

	[data-part='map-error'] {
		display: grid;
		place-items: center;
		height: 100%;
		padding: 1rem;
		text-align: center;
		color: inherit;
		opacity: 0.6;
	}
</style>
