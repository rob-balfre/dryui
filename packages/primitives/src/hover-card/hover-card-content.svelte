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
			ctx.close();
		}
	}
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	role="dialog"
	popover="manual"
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	onpointerenter={() => ctx.show()}
	onpointerleave={() => ctx.close()}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
