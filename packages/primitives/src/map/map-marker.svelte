<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getMapCtx, setMarkerCtx } from './context.svelte.js';
	import { onDestroy, untrack } from 'svelte';
	import type { LngLat, MapMarkerInstance, MarkerOptions } from './types.js';

	interface Props {
		position: LngLat;
		color?: string;
		children?: Snippet;
		class?: string;
	}

	let { position, color, children, class: className }: Props = $props();

	const ctx = getMapCtx();

	let markerInstance = $state<MapMarkerInstance | null>(null);
	let contentEl = $state<HTMLDivElement>();

	setMarkerCtx({
		get marker() {
			return markerInstance;
		},
		get position() {
			return position;
		}
	});

	$effect(() => {
		if (!ctx.loaded || !ctx.map || !ctx.lib) return;

		// Remove previous marker without tracking markerInstance as a dependency
		const prev = untrack(() => markerInstance);
		if (prev) {
			prev.remove();
		}

		const opts: MarkerOptions = {};
		if (children && contentEl) {
			opts.element = contentEl;
		}
		if (color && !children) {
			opts.color = color;
		}

		try {
			const marker = new ctx.lib.Marker(opts).setLngLat(position).addTo(ctx.map);
			markerInstance = marker;
		} catch {
			// Marker creation failed
		}
	});

	// Update position reactively
	$effect(() => {
		if (markerInstance && position) {
			markerInstance.setLngLat(position);
		}
	});

	onDestroy(() => {
		if (markerInstance) {
			markerInstance.remove();
			markerInstance = null;
		}
	});
</script>

{#if children}
	<div bind:this={contentEl} data-part="marker-content" class={['marker-content', className]}>
		{@render children()}
	</div>
{/if}

<style>
	.marker-content {
		cursor: pointer;
	}
</style>
