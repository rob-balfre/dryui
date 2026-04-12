<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { size = 'md', children, ...rest }: Props = $props();

	const ctx = getSelectCtx();
</script>

<Button
	variant="outline"
	{size}
	type="button"
	id={ctx.triggerId}
	popovertarget={ctx.contentId}
	aria-haspopup="listbox"
	aria-expanded={ctx.open}
	aria-controls={ctx.open ? ctx.contentId : undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	data-select-trigger
	disabled={ctx.disabled}
	ref={(el) => (ctx.triggerEl = el)}
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
</Button>

<style>
	svg[data-indicator] {
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		opacity: 0.5;
		transition: transform var(--dry-duration-fast) var(--dry-ease-default);
	}
</style>
