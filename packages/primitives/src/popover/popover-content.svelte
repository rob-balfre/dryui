<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../utils/anchor-position.svelte.js';
	import { getPopoverCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getPopoverCtx();

	let contentEl = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	createDismiss({
		enabled: () => ctx.open,
		onDismiss: () => ctx.close(),
		contentEl: () => contentEl ?? null,
		triggerEl: () => ctx.triggerEl,
		preventDefaultOnEscape: true,
		returnFocusTo: () => ctx.triggerEl
	});
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	popover="manual"
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	{...rest}
>
	{@render children()}
</div>
