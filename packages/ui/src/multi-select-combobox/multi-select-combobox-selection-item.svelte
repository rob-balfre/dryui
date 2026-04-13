<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		value: string;
		children?: Snippet | undefined;
	}

	let { class: className, value, children, ...rest }: Props = $props();

	const ctx = getMultiSelectComboboxCtx();
</script>

{#if ctx.isSelected(value)}
	<span
		role="listitem"
		data-multi-select-selection-item
		data-value={value}
		class={className}
		{...rest}
	>
		{#if children}
			{@render children()}
		{:else}
			{value}
		{/if}
	</span>
{/if}

<style>
	[data-multi-select-selection-item] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding-block: 4px;
		padding-inline-start: var(--dry-space-2);
		padding-inline-end: 0;
		background: var(--dry-color-fill-brand-weak);
		color: var(--dry-color-text-brand);
		box-shadow: inset 0 0 0 1px var(--dry-color-stroke-selected);
		border-radius: var(--dry-radius-md);
		overflow: hidden;
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		font-family: var(--dry-font-sans);
		font-weight: 500;
		line-height: 1.5;
		white-space: nowrap;
		user-select: none;
		--dry-btn-radius: 0;
		--dry-btn-padding-x: var(--dry-space-2);
		--dry-btn-padding-y: 0;
		--dry-btn-font-size: inherit;
	}

	@container (max-width: 200px) {
		[data-multi-select-selection-item] {
			grid-template-columns: 1fr auto;
		}
	}
</style>
