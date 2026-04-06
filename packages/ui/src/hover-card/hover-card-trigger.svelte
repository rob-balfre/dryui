<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getHoverCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLAnchorElement> {
		href?: string;
		children: Snippet;
	}

	let { href, class: className, children, ...rest }: Props = $props();

	const ctx = getHoverCardCtx();

	let anchorEl = $state<HTMLAnchorElement>();

	$effect(() => {
		if (anchorEl) {
			ctx.triggerEl = anchorEl;
		}
	});
</script>

<a
	bind:this={anchorEl}
	id={ctx.triggerId}
	{href}
	data-hover-card-trigger
	aria-haspopup="true"
	aria-expanded={ctx.open}
	data-state={ctx.open ? 'open' : 'closed'}
	onpointerenter={() => ctx.show()}
	onpointerleave={() => ctx.close()}
	onfocus={() => ctx.show()}
	onblur={() => ctx.close()}
	class={className}
	{...rest}
>
	{@render children()}
</a>

<style>
	[data-hover-card-trigger] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		color: var(--dry-color-text-brand);
		text-decoration: underline;
		text-decoration-color: var(--dry-color-stroke-brand);
		text-decoration-thickness: 1px;
		text-underline-offset: 0.18em;
		cursor: help;
		transition:
			color var(--dry-duration-fast) var(--dry-ease-default),
			text-decoration-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-hover-card-trigger]:hover {
		color: var(--dry-color-fill-brand-hover);
		text-decoration-color: currentColor;
	}

	[data-hover-card-trigger]:focus-visible {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: 3px;
		border-radius: var(--dry-radius-sm);
	}
</style>
