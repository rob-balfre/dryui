<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, untrack } from 'svelte';
	import { getMapCtx, getMarkerCtx } from './context.svelte.js';
	import type { MapPopupInstance, PopupOptions } from '@dryui/primitives';

	interface Props {
		maxWidth?: string;
		closeButton?: boolean;
		closeOnClick?: boolean;
		children: Snippet;
		class?: string;
	}

	let {
		maxWidth = '20rem',
		closeButton = true,
		closeOnClick = true,
		children,
		class: className
	}: Props = $props();

	const mapCtx = getMapCtx();
	const markerCtx = getMarkerCtx();

	let popupInstance = $state<MapPopupInstance | null>(null);
	let contentEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!mapCtx.loaded || !mapCtx.map || !mapCtx.lib || !markerCtx.marker || !contentEl) return;

		// Remove previous popup without tracking popupInstance as a dependency
		const prev = untrack(() => popupInstance);
		if (prev) {
			prev.remove();
		}

		try {
			const popupOptions: PopupOptions = {
				maxWidth,
				closeButton,
				closeOnClick
			};
			if (className) popupOptions.className = className;
			const popup = new mapCtx.lib.Popup(popupOptions).setDOMContent(contentEl);

			markerCtx.marker.setPopup(popup);
			popupInstance = popup;
		} catch {
			// Popup creation failed
		}
	});

	onDestroy(() => {
		if (popupInstance) {
			popupInstance.remove();
			popupInstance = null;
		}
	});
</script>

<div bind:this={contentEl} data-part="popup-content">
	{@render children()}
</div>

<style>
	[data-part='popup-content'] {
		display: grid;
		grid-template-columns: minmax(0, 20rem);
	}
</style>
