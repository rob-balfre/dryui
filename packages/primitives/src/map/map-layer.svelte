<script lang="ts">
	import { getMapCtx } from './context.svelte.js';
	import { onDestroy } from 'svelte';
	import type { GeoJsonData } from './types.js';

	interface Props {
		id: string;
		type: 'heatmap' | 'polygon' | 'fill' | 'circle' | 'line';
		data: GeoJsonData;
		color?: string;
		opacity?: number;
	}

	let { id, type, data, color, opacity }: Props = $props();

	const ctx = getMapCtx();
	const sourceId = $derived(`source-${id}`);
	let added = $state(false);

	// Map 'polygon' alias to the mapbox/maplibre 'fill' layer type
	const resolvedType = $derived(type === 'polygon' ? 'fill' : type);

	$effect(() => {
		if (!ctx.loaded || !ctx.map) return;

		const map = ctx.map;

		if (!added) {
			// Add source
			if (!map.getSource(sourceId)) {
				map.addSource(sourceId, {
					type: 'geojson',
					data
				});
			}

			// Build paint properties based on layer type
			const paint: Record<string, unknown> = {};
			const lt = resolvedType;

			if (lt === 'fill') {
				if (color) paint['fill-color'] = color;
				if (opacity !== undefined) paint['fill-opacity'] = opacity;
			} else if (lt === 'circle') {
				if (color) paint['circle-color'] = color;
				if (opacity !== undefined) paint['circle-opacity'] = opacity;
			} else if (lt === 'heatmap') {
				if (opacity !== undefined) paint['heatmap-opacity'] = opacity;
			} else if (lt === 'line') {
				if (color) paint['line-color'] = color;
				if (opacity !== undefined) paint['line-opacity'] = opacity;
			}

			if (!map.getLayer(id)) {
				map.addLayer({
					id,
					type: lt,
					source: sourceId,
					paint
				});
			}

			added = true;
		}
	});

	// Update data reactively
	$effect(() => {
		if (!added || !ctx.map) return;
		const source = ctx.map.getSource(sourceId);
		if (source && data) {
			source.setData(data);
		}
	});

	// Update paint properties reactively
	$effect(() => {
		if (!added || !ctx.map) return;
		const map = ctx.map;
		const lt = resolvedType;

		if (lt === 'fill') {
			if (color) map.setPaintProperty(id, 'fill-color', color);
			if (opacity !== undefined) map.setPaintProperty(id, 'fill-opacity', opacity);
		} else if (lt === 'circle') {
			if (color) map.setPaintProperty(id, 'circle-color', color);
			if (opacity !== undefined) map.setPaintProperty(id, 'circle-opacity', opacity);
		} else if (lt === 'heatmap') {
			if (opacity !== undefined) map.setPaintProperty(id, 'heatmap-opacity', opacity);
		} else if (lt === 'line') {
			if (color) map.setPaintProperty(id, 'line-color', color);
			if (opacity !== undefined) map.setPaintProperty(id, 'line-opacity', opacity);
		}
	});

	onDestroy(() => {
		if (ctx.map && added) {
			try {
				if (ctx.map.getLayer(id)) ctx.map.removeLayer(id);
				if (ctx.map.getSource(sourceId)) ctx.map.removeSource(sourceId);
			} catch {
				// Map may already be destroyed
			}
		}
	});
</script>
