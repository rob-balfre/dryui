<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchorPosition } from '@dryui/primitives';
	import type { Placement } from '@dryui/primitives';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

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

	const ctx = getMultiSelectComboboxCtx();

	let el = $state<HTMLDivElement | null>(null);

	const anchor = createAnchorPosition(
		() => ctx.anchorEl,
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

	function attachContent(node: HTMLDivElement) {
		el = node;

		return () => {
			if (el === node) {
				el = null;
			}
		};
	}

	function syncPopover(isOpen: boolean) {
		return (node: HTMLDivElement) => {
			if (isOpen && !node.matches(':popover-open')) {
				node.showPopover();
			} else if (!isOpen && node.matches(':popover-open')) {
				node.hidePopover();
			}
		};
	}

	function dismissOnOutsidePointerDown(node: HTMLDivElement) {
		function handlePointerDown(event: PointerEvent) {
			const target = event.target;
			if (!(target instanceof Node)) {
				return;
			}

			if (ctx.anchorEl?.contains(target) || node.contains(target)) {
				return;
			}

			ctx.close();
		}

		document.addEventListener('pointerdown', handlePointerDown);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
		};
	}
</script>

<div
	{@attach attachContent}
	{@attach syncPopover(ctx.open)}
	{@attach ctx.open && dismissOnOutsidePointerDown}
	popover="manual"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.inputId}
	aria-multiselectable="true"
	data-multi-select-content
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
	[data-multi-select-content] {
		inset: unset;
		margin: 0;
		background: var(--dry-color-bg-overlay);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		box-shadow: var(--dry-shadow-lg);
		padding: var(--dry-space-1);
		max-height: 240px;
		overflow-y: auto;
		z-index: 20;

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-multi-select-content]:not(:popover-open) {
		display: none;
	}

	[data-multi-select-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-multi-select-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}

	[data-multi-select-content] [data-part='loading'] {
		display: grid;
		place-items: center;
		padding: var(--dry-space-4);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}
</style>
