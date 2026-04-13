<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getListCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		interactive?: boolean;
		disabled?: boolean;
		children: Snippet;
	}

	let {
		interactive = false,
		disabled = false,
		class: className,
		children,
		onclick,
		...rest
	}: Props = $props();

	const ctx = getListCtx();

	function handleKeydown(e: KeyboardEvent) {
		if (!interactive || disabled) return;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (onclick) {
				(onclick as (e: Event) => void)(e);
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<li
	data-list-item
	data-interactive={interactive || undefined}
	data-disabled={disabled || undefined}
	data-dense={ctx.dense || undefined}
	role={interactive ? 'button' : undefined}
	tabindex={interactive && !disabled ? 0 : undefined}
	aria-disabled={disabled || undefined}
	class={className}
	{onclick}
	onkeydown={interactive ? handleKeydown : undefined}
	{...rest}
>
	{@render children()}
</li>

<style>
	[data-list-item] {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: var(--dry-list-item-gap);
		padding: var(--dry-list-item-padding);
		border-radius: var(--dry-list-item-radius);
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-list-item][data-interactive='true'] {
		cursor: pointer;
	}

	[data-list-item][data-interactive='true']:hover,
	[data-list-item][data-interactive='true']:focus-visible {
		background: var(--dry-list-item-hover-bg);
	}

	[data-list-item][data-interactive='true']:active {
		background: var(--dry-list-item-active-bg);
	}

	[data-list-item][data-interactive='true']:focus-visible {
		outline: var(--dry-focus-ring);
		outline-offset: -2px;
	}

	[data-list-item][data-disabled='true'] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
		pointer-events: none;
	}

	[data-list-item][data-dense='true'] {
		--dry-list-item-padding: var(--dry-space-1_5) var(--dry-space-2);
	}
</style>
