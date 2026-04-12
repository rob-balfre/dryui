<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getColorPickerCtx();

	const isSupported = $derived(typeof window !== 'undefined' && 'EyeDropper' in window);

	async function handleClick() {
		if (!isSupported || ctx.disabled) return;

		try {
			// @ts-expect-error EyeDropper API not yet in standard TS lib
			const eyeDropper = new window.EyeDropper();
			const result = await eyeDropper.open();
			if (result?.sRGBHex) {
				ctx.setFromHex(result.sRGBHex);
			}
		} catch {
			// User cancelled or error
		}
	}
</script>

{#if isSupported}
	<Button
		variant="outline"
		size="icon-sm"
		type="button"
		aria-label="Pick color from screen"
		disabled={ctx.disabled}
		onclick={handleClick}
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else}
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
				><path
					d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3l8 8M3 9l8 8m-8-8 1.5 1.5M11 17l-1 4-4 1 1-4"
				/></svg
			>
		{/if}
	</Button>
{/if}
