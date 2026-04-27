<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, createDismiss, type Placement } from '@dryui/primitives';
	import { getComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		loading?: boolean;
		loadingContent?: Snippet;
		children: Snippet;
	}

	let {
		class: className,
		placement = 'bottom-start',
		offset = 4,
		loading = false,
		loadingContent,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getComboboxCtx();
	const getTriggerEl = () => ctx.triggerEl ?? ctx.inputEl;

	let el = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: getTriggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	createDismiss({
		enabled: () => ctx.open,
		escapeKey: false,
		onDismiss: () => ctx.close(),
		contentEl: () => el ?? null,
		triggerEl: getTriggerEl
	});
</script>

<div
	bind:this={el}
	use:popover.applyPosition={style}
	popover="manual"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.inputId}
	data-combobox-content
	data-dry-stagger
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	{...rest}
>
	{#if loading}
		<div data-part="loading" role="status" aria-live="polite">
			{#if loadingContent}
				{@render loadingContent()}
			{:else}
				Loading...
			{/if}
		</div>
	{:else}
		{@render children()}
	{/if}
</div>

<style>
	[data-combobox-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		display: grid;
		grid-template-columns: minmax(
			max(var(--dry-combobox-content-min-inline-size, 12rem), anchor-size(inline)),
			max-content
		);
		background: var(--dry-color-bg-overlay);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-1);
		max-height: 200px;
		overflow-y: auto;

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-combobox-content]:not(:popover-open) {
		display: none;
	}

	[data-combobox-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-combobox-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}

	[data-combobox-content] [data-part='loading'] {
		display: grid;
		place-items: center;
		padding: var(--dry-space-4);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size);
	}
</style>
