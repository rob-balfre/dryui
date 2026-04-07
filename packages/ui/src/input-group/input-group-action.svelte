<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAffixGroupCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { disabled = false, children, type = 'button', class: className, ...rest }: Props = $props();

	const ctx = getAffixGroupCtx();

	let isDisabled = $derived(disabled || ctx.disabled);
</script>

<button
	{type}
	disabled={isDisabled}
	data-part="action"
	data-size={ctx.size}
	data-disabled={isDisabled || undefined}
	data-invalid={ctx.invalid || undefined}
	data-orientation={ctx.orientation}
	{...rest}
	data-input-group-action
	class={className}
>
	{@render children?.()}
</button>

<style>
	[data-input-group-action] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0.5rem;
		padding: 0 var(--dry-input-group-padding-x);
		white-space: nowrap;
		appearance: none;
		border: 0;
		background: transparent;
		color: var(--dry-color-text-strong);
		cursor: pointer;
		font: inherit;
		font-size: var(--dry-input-group-font-size);
		transition: background-color 160ms ease;
	}

	[data-input-group-action][data-orientation='horizontal'] {
		grid-column: 5;
	}

	[data-input-group-action]:hover:not(:disabled) {
		background: var(--dry-color-fill-weak);
	}

	[data-input-group-action]:focus-visible {
		outline: none;
		background: var(--dry-color-fill-weak);
	}

	[data-input-group-action]:disabled {
		cursor: not-allowed;
	}
</style>
