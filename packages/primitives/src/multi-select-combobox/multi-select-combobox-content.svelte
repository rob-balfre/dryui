<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';
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

	function attachContent(node: HTMLDivElement) {
		el = node;

		return () => {
			if (el === node) {
				el = null;
			}
		};
	}

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.anchorEl,
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
		triggerEl: () => ctx.anchorEl
	});
</script>

<div
	{@attach attachContent}
	{@attach fromAction(popover.applyPosition, () => style)}
	popover="manual"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.inputId}
	aria-multiselectable="true"
	data-state={ctx.open ? 'open' : 'closed'}
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
