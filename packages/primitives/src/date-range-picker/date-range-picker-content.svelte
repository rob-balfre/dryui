<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	let el = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => el ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});
</script>

<div
	bind:this={el}
	popover="auto"
	role="dialog"
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
	{...rest}
>
	{@render children()}
</div>
