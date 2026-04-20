<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, type Placement } from '../utils/anchored-popover.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';

	interface OverlayContext {
		readonly open: boolean;
		readonly contentId: string;
		readonly triggerId?: string;
		readonly triggerEl: HTMLElement | null;
	}

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ctx: OverlayContext;
		placement?: Placement;
		offset?: number;
		popoverMode?: 'auto' | 'manual';
		onContentElChange?: (element: HTMLDivElement | null) => void;
		dismiss?: boolean;
		onDismiss?: () => void;
		preventDefaultOnEscape?: boolean;
		returnFocusTo?: () => HTMLElement | null;
		children: Snippet;
	}

	let {
		ctx,
		placement = 'bottom',
		offset = 8,
		popoverMode = 'manual',
		onContentElChange,
		dismiss = false,
		onDismiss,
		preventDefaultOnEscape = false,
		returnFocusTo,
		children,
		style,
		...rest
	}: Props = $props();

	let contentEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		onContentElChange?.(contentEl);
	});

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	createDismiss({
		enabled: () => dismiss && ctx.open,
		onDismiss: () => onDismiss?.(),
		contentEl: () => contentEl ?? null,
		triggerEl: () => ctx.triggerEl,
		preventDefaultOnEscape: () => preventDefaultOnEscape,
		returnFocusTo: () => returnFocusTo?.() ?? null
	});
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	popover={popoverMode}
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	{...rest}
>
	{@render children()}
</div>
