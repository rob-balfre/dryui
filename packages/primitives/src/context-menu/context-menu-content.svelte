<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';
	import { createMenuNavigation } from '../utils/menu-navigation.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, style, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();

	let el = $state<HTMLDivElement>();

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});

	$effect(() => {
		if (ctx.open && el) {
			el.style.position = 'fixed';
			el.style.left = `${ctx.position.x}px`;
			el.style.top = `${ctx.position.y}px`;
			if (!el.matches(':popover-open')) {
				el.showPopover();
				menu.focusFirst();
			}
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	createDismiss({
		enabled: () => ctx.open,
		onDismiss: () => ctx.close(),
		contentEl: () => el ?? null,
		preventDefaultOnEscape: true
	});
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
	onkeydown={(e) => menu.handleKeydown(e)}
	{...rest}
>
	{@render children()}
</div>
