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

<span class="root">
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
			data-state={ctx.open ? 'open' : 'closed'}
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg
		>
	</Button>
</span>

<style>
	.root {
		display: grid;
		--dry-btn-justify: space-between;
		--dry-btn-align: center;
	}

	svg[data-indicator] {
		height: 1em;
		aspect-ratio: 1;
		place-self: center;
		opacity: 0.5;
		transform-origin: center;
		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-fast) var(--dry-ease-spring-snappy),
			filter var(--dry-duration-fast) var(--dry-ease-spring-snappy);
	}

	svg[data-indicator][data-state='open'] {
		opacity: 1;
		transform: scale(1.05);
	}

	@media (prefers-reduced-motion: reduce) {
		svg[data-indicator] {
			transition: none;
			filter: none;
		}
	}
</style>
