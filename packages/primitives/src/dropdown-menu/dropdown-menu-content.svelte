<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../utils/anchor-position.svelte.js';
	import { getDropdownMenuCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';
	import { createMenuNavigation } from '../utils/menu-navigation.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getDropdownMenuCtx();

	let el = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: () => menu.focusFirst()
	});

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});
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
	onkeydown={(e) => menu.handleKeydown(e)}
	{...rest}
>
	{@render children()}
</div>
