<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../utils/anchor-position.svelte.js';
	import { getHoverCardCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getHoverCardCtx();

	let contentEl = $state<HTMLDivElement>();

	$effect(() => {
		if (contentEl) {
			ctx.contentEl = contentEl;

			return () => {
				if (ctx.contentEl === contentEl) {
					ctx.contentEl = null;
				}
			};
		}
	});

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.forceClose();
			ctx.ignoreNextTriggerFocusOpen = true;
			ctx.triggerEl?.focus();
		}
	}

	function handlePointerEnter() {
		ctx.contentHovered = true;
		ctx.showImmediate();
	}

	function handlePointerLeave() {
		ctx.contentHovered = false;
		ctx.close();
	}

	function handleFocusIn() {
		ctx.contentFocused = true;
		ctx.showImmediate();
	}

	function handleFocusOut() {
		ctx.contentFocused = false;
		ctx.close();
	}
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	role="dialog"
	aria-labelledby={ctx.triggerId}
	popover="manual"
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
