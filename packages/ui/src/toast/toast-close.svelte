<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { toastStore } from '@dryui/primitives';
	import { getToastCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getToastCtx();
</script>

<button
	type="button"
	aria-label="Close notification"
	data-part="close"
	class={className}
	onclick={() => toastStore.remove(ctx.id)}
	{...rest}
>
	{@render children()}
</button>

<style>
	[data-part='close'] {
		position: absolute;
		top: var(--dry-space-4);
		right: var(--dry-space-4);
		z-index: 1;
		cursor: pointer;
		background: none;
		border: none;
		box-sizing: border-box;
		padding: var(--dry-space-2);
		color: var(--dry-color-text-weak);
		border-radius: var(--dry-radius-sm);
		min-height: var(--dry-space-12);
		aspect-ratio: 1;
		display: inline-grid;
		place-items: center;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default);

		&:hover {
			background: var(--dry-toast-close-hover-bg, var(--dry-color-fill));
			color: var(--dry-color-text-strong);
		}

		&:active {
			transform: translateY(1px);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}
	}
</style>
