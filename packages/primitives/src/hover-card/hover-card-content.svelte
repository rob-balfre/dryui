<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getHoverCardCtx } from './context.svelte.js';
	import OverlayContent from '../internal/overlay-content.svelte';
	import type { Placement } from '../utils/anchor-position.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getHoverCardCtx();

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

<OverlayContent
	{ctx}
	{placement}
	{offset}
	{style}
	role="dialog"
	onContentElChange={(element) => {
		ctx.contentEl = element;
	}}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</OverlayContent>
