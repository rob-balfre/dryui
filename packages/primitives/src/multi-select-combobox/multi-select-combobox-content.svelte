<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';
	import { getMultiSelectComboboxCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?:
			| 'top'
			| 'top-start'
			| 'top-end'
			| 'bottom'
			| 'bottom-start'
			| 'bottom-end'
			| 'left'
			| 'left-start'
			| 'left-end'
			| 'right'
			| 'right-start'
			| 'right-end';
		offset?: number;
		loading?: boolean;
		loadingContent?: Snippet;
		children: Snippet;
	}

	let {
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

	const anchor = useAnchorStyles({
		triggerEl: () => ctx.anchorEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
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
	data-state={ctx.open ? 'open' : 'closed'}
	use:anchor.applyPosition={style}
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
