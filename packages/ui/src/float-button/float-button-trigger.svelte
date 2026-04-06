<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, class: className, size = 'md', ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();
</script>

<button
	type="button"
	aria-expanded={ctx.open}
	data-state={ctx.open ? 'open' : 'closed'}
	data-float-button-trigger
	class={className}
	onclick={() => ctx.toggle()}
	{...rest}
>
	{@render children()}
</button>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-float-button-trigger-wrapper] {
		display: contents;
	}

	[data-float-button-trigger-wrapper] :where(button) {
		--dry-fab-bg: var(--dry-color-fill-brand);
		--dry-fab-color: var(--dry-color-on-brand);
		--dry-fab-shadow: var(--dry-shadow-lg);

		display: grid;
		place-items: center;
		padding: 0;
		background: var(--dry-fab-bg);
		color: var(--dry-fab-color);
		border: none;
		border-radius: 50%;
		box-shadow: var(--dry-fab-shadow);
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			transform var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);

		&:hover {
			--dry-fab-bg: var(--dry-color-fill-brand-hover);
			box-shadow: var(--dry-shadow-xl);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}

		&:active {
			transform: scale(0.95);
		}

		&[data-state='open'] {
			transform: rotate(45deg);
		}

		&[data-state='open']:active {
			transform: rotate(45deg) scale(0.95);
		}
	}

	[data-float-button-trigger-wrapper][data-size='sm'] :where(button) {
		height: 44px;
		aspect-ratio: 1;
	}

	[data-float-button-trigger-wrapper][data-size='md'] :where(button) {
		height: 52px;
		aspect-ratio: 1;
	}

	[data-float-button-trigger-wrapper][data-size='lg'] :where(button) {
		height: 60px;
		aspect-ratio: 1;
	}
</style>
