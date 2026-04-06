<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';
	import { getMenuItems, focusFirstItem, handleMenuKeydown } from '../internal/menu-navigation.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, style, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (ctx.open && el) {
			el.style.position = 'fixed';
			el.style.left = `${ctx.position.x}px`;
			el.style.top = `${ctx.position.y}px`;
			if (!el.matches(':popover-open')) {
				el.showPopover();
				focusFirstItem(el, getMenuItems(el));
			}
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	// Manual dismiss: close on click outside or Escape
	$effect(() => {
		if (!ctx.open) return;

		function handlePointerDown(e: PointerEvent) {
			if (el?.contains(e.target as Node)) return;
			ctx.close();
		}

		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				e.preventDefault();
				ctx.close();
			}
		}

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown, true);
		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		handleMenuKeydown(e, getMenuItems(el));
	}
</script>

<div
	bind:this={el}
	popover="manual"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-state={ctx.open ? 'open' : 'closed'}
	{style}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>
