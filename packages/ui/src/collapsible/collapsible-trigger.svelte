<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getCollapsibleCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getCollapsibleCtx();
</script>

<button
	type="button"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled || undefined}
	data-collapsible-trigger
	disabled={ctx.disabled}
	class={className}
	onclick={() => ctx.toggle()}
	{...rest}
>
	{@render children()}
	<svg
		data-indicator
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
	>
</button>

<style>
	[data-collapsible-trigger] {
		display: grid;
		grid-template-columns: 1fr 1rem;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3) var(--dry-space-4);
		background: none;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		font-family: var(--dry-font-sans);
		cursor: pointer;
		color: var(--dry-color-text-strong);

		& [data-indicator] {
			height: 1rem;
			aspect-ratio: 1;
			opacity: 0.5;
			transition: transform var(--dry-duration-fast) var(--dry-ease-default);
		}

		&[data-state='open'] [data-indicator] {
			transform: rotate(180deg);
		}

		&:hover:not([data-disabled]) {
			background: color-mix(in srgb, var(--dry-color-fill-brand) 5%, transparent);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}

		&[data-disabled] {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}
</style>
