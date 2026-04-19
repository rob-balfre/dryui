<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { getOptionItems, handleMenuKeydown } from '../internal/menu-navigation.js';

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
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getSelectCtx();

	let el = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: (node) => focusFirstSelectItem(node)
	});

	function focusFirstSelectItem(container: HTMLElement) {
		const items = getOptionItems(container);
		const selected = items.find((item) => item.getAttribute('aria-selected') === 'true');
		if (selected) {
			selected.focus();
		} else if (items[0]) {
			items[0].focus();
		} else {
			container.focus();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			ctx.close();
			ctx.triggerEl?.focus();
			return;
		}
		handleMenuKeydown(e, getOptionItems(el));
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="listbox"
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
