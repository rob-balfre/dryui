<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
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

		if (popupInstance) {
			popupInstance.remove();
			popupInstance = null;
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
