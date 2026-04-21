<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';
	import { createDismiss } from '../utils/dismiss.svelte.js';
	import { createMenuNavigation } from '../utils/menu-navigation.svelte.js';
	import { tryShowPopover, tryHidePopover } from '../utils/popover-toggle.js';

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
		if (!el) return;
		if (ctx.open) {
			el.style.position = 'fixed';
			el.style.left = `${ctx.position.x}px`;
			el.style.top = `${ctx.position.y}px`;
			const wasOpen = el.matches(':popover-open');
			tryShowPopover(el);
			if (!wasOpen) menu.focusFirst();
		} else {
			tryHidePopover(el);
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
