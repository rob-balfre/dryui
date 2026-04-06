<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../utils/anchor-position.svelte.js';
	import { getDropdownMenuCtx } from './context.svelte.js';
	import { createPositionedPopover } from '../utils/positioned-popover.svelte.js';
	import { getMenuItems, focusFirstItem, handleMenuKeydown } from '../internal/menu-navigation.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getDropdownMenuCtx();

	let el = $state<HTMLDivElement>();

	const popover = createPositionedPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (ctx.open && el && !el.matches(':popover-open')) {
			popover.showPopover(el);
			const items = getMenuItems(el);
			focusFirstItem(el, items);
		} else if (!ctx.open && el?.matches(':popover-open')) {
			popover.hidePopover(el);
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		handleMenuKeydown(e, getMenuItems(el));
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
		} else if (!newState && ctx.open) {
			ctx.close();
		}
	}}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
