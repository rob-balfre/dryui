<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getCommandPaletteCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		onSelect?: () => void;
		children: Snippet;
	}

	let { value, disabled, onSelect, class: className, children, ...rest }: Props = $props();

	const ctx = getCommandPaletteCtx();
	const uid = $props.id();
	const id = `cmd-item-${uid}`;

	let visible = $derived.by(() => {
		const q = ctx.query.toLowerCase().trim();
		if (!q) return true;
		return value.toLowerCase().includes(q);
	});

	function attachItem(node: HTMLDivElement) {
		ctx.registerItem(id, node);
		return () => ctx.unregisterItem(id);
	}
</script>

{#if visible}
	<div
		{@attach attachItem}
		{id}
		role="option"
		data-command-palette-item
		aria-selected={ctx.activeItemId === id}
		data-disabled={disabled || undefined}
		data-active={ctx.activeItemId === id || undefined}
		data-value={value}
		onpointerenter={() => {
			if (!disabled) {
				ctx.setActiveItem(id);
			}
		}}
		onclick={() => {
			if (!disabled) {
				onSelect?.();
				ctx.close();
			}
		}}
		class={className}
		{...rest}
	>
		{@render children()}
	</div>
{/if}

<style>
	[data-command-palette-item] {
		--dry-cmd-item-radius: min(var(--dry-radius-nested-dialog), var(--dry-space-4));

		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2_5) var(--dry-space-2);
		border-radius: var(--dry-cmd-item-radius);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		cursor: pointer;
		color: var(--dry-color-text-strong);
		min-height: var(--dry-space-11);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-out),
			transform var(--dry-duration-fast) var(--dry-ease-out);

		@starting-style {
			opacity: 0;
			transform: translateY(4px);
		}
	}

	[data-command-palette-item]:hover:not([data-disabled]) {
		background: color-mix(in srgb, var(--dry-color-text-strong) 5%, transparent);
	}

	[data-command-palette-item][data-active] {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 10%, transparent);
	}

	[data-command-palette-item][data-disabled] {
		opacity: var(--dry-state-disabled-opacity);
		cursor: not-allowed;
	}
</style>
