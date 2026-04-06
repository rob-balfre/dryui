<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getComboboxCtx } from './context.svelte.js';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';

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

	const anchor = useAnchorStyles({
		triggerEl: () => ctx.inputEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (ctx.open && el && !el.matches(':popover-open')) {
			el.showPopover();
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	// Manual dismiss: close on click outside input+popover, or Escape
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
