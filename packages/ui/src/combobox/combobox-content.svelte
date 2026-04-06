<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchorPosition } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
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

	let el = $state<HTMLDivElement>();

	const anchor = createAnchorPosition(
		() => ctx.inputEl,
		() => el ?? null,
		{
			get placement() {
				return placement;
			},
			get offset() {
				return offset;
			}
		}
	);

	$effect(() => {
		if (!el) return;

		el.style.cssText = typeof style === 'string' ? style : '';
		const positionStyles = anchor.styles;
		for (const [key, value] of Object.entries(positionStyles)) {
			el.style.setProperty(key, value);
		}
	});

	$effect(() => {
		if (ctx.open && el && !el.matches(':popover-open')) {
			el.showPopover();
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	// Manual dismiss: close on click outside input+popover
	$effect(() => {
		if (!ctx.open) return;

		function handlePointerDown(e: PointerEvent) {
			const target = e.target as Node;
			if (ctx.inputEl?.contains(target) || el?.contains(target)) return;
			ctx.close();
		}

		document.addEventListener('pointerdown', handlePointerDown);
		return () => document.removeEventListener('pointerdown', handlePointerDown);
	});
</script>

<div
	bind:this={el}
	popover="manual"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.inputId}
	data-combobox-content
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
		grid-template-columns: minmax(12rem, max-content);
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
