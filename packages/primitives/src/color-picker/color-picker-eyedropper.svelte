<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet | undefined;
	}

	let { class: className, children, ...rest }: Props = $props();

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
			// User cancelled or error — ignore
		}
	}
</script>

{#if isSupported}
	<button
		type="button"
		onclick={handleClick}
		disabled={ctx.disabled}
		aria-label="Pick color from screen"
		data-disabled={ctx.disabled || undefined}
		class={className}
		{...rest}
	>
		{#if children}
			{@render children()}
		{/if}
	</button>
{/if}
