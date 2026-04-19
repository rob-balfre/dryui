<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';

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

	const ctx = getComboboxCtx();

	let el = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.inputEl,
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
		triggerEl: () => ctx.inputEl
	});
</script>

<div
	bind:this={el}
	popover="manual"
	role="listbox"
	id={ctx.contentId}
	aria-labelledby={ctx.inputId}
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
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
