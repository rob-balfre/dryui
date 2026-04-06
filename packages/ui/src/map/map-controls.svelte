<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy } from 'svelte';
	import { getMapCtx } from './context.svelte.js';
	import type { MapControl } from '@dryui/primitives';

	interface Props {
		position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
		navigation?: boolean;
		fullscreen?: boolean;
		children?: Snippet;
	}

	let {
		position = 'top-right',
		navigation = false,
		fullscreen = false,
		children
	}: Props = $props();

	const ctx = getMapCtx();
	let controls: MapControl[] = [];

	$effect(() => {
		if (!ctx.loaded || !ctx.map || !ctx.lib) return;

		cleanupControls();

		if (navigation && ctx.lib.NavigationControl) {
			try {
				const nav = new ctx.lib.NavigationControl();
				ctx.map.addControl(nav, position);
				controls.push(nav);
			} catch {
				// Control creation failed
			}
		}

		if (fullscreen && ctx.lib.FullscreenControl) {
			try {
				const fs = new ctx.lib.FullscreenControl();
				ctx.map.addControl(fs, position);
				controls.push(fs);
			} catch {
				// Control creation failed
			}
		}
	});

	function cleanupControls() {
		for (const control of controls) {
			try {
				ctx.map?.removeControl(control);
			} catch {
				// Control may already be removed
			}
		}
		controls = [];
	}

	onDestroy(() => {
		cleanupControls();
	});
</script>

{#if children}
	{@render children()}
{/if}
