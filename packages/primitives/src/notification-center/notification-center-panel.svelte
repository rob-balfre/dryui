<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getNotificationCenterCtx } from './context.svelte.js';
	import { createAnchoredPopover } from '../utils/anchored-popover.svelte.js';

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

	let { placement = 'bottom-end', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getNotificationCenterCtx();

	let panelEl = $state<HTMLDivElement>();

	const popover = createAnchoredPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => panelEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset
	});
</script>

<div
	bind:this={panelEl}
	id={ctx.panelId}
	popover="auto"
	role="region"
	aria-label="Notifications"
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	ontoggle={(e) => {
		const event = /** @type {ToggleEvent} */ (e);
		if (event.newState === 'open') {
			ctx.show();
		} else {
			ctx.close();
		}
	}}
	{...rest}
>
	{@render children()}
</div>
