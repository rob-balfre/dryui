<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getColorPickerCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
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
			// User cancelled or error
		}
	}
</script>

{#if isSupported}
	<button
		type="button"
		onclick={handleClick}
		disabled={ctx.disabled}
		aria-label="Pick color from screen"
		data-cp-eyedropper
		data-disabled={ctx.disabled || undefined}
		class={className}
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
	</button>
{/if}

<style>
	[data-cp-eyedropper] {
		display: inline-grid;
		grid-auto-flow: column;
		place-items: center;
		gap: var(--dry-space-1_5);
		padding: var(--dry-space-2);
		font-size: var(--dry-type-small-size);
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-cp-eyedropper] svg {
		height: 1rem;
		aspect-ratio: 1;
	}

	[data-cp-eyedropper]:hover:not([data-disabled]):not(:disabled) {
		background: var(--dry-color-picker-surface-hover);
		border-color: var(--dry-color-stroke-strong);
	}

	[data-cp-eyedropper]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: -1px;
	}

	[data-cp-eyedropper][data-disabled],
	[data-cp-eyedropper]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
