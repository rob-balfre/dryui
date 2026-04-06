<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';
	import { getNotificationCenterCtx } from './context.svelte.js';

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

	let {
		placement = 'bottom-end',
		offset = 8,
		class: className,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getNotificationCenterCtx();

	let panelEl = $state<HTMLDivElement>();

	const anchor = useAnchorStyles({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => panelEl ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (!panelEl) return;

		if (ctx.open) {
			try {
				if (!panelEl.matches(':popover-open')) {
					panelEl.showPopover();
				}
			} catch {
				// Already shown
			}
		} else {
			try {
				if (panelEl.matches(':popover-open')) {
					panelEl.hidePopover();
				}
			} catch {
				// Already hidden
			}
		}
	});
</script>

<div
	bind:this={panelEl}
	id={ctx.panelId}
	popover="auto"
	role="region"
	aria-label="Notifications"
	data-notification-center-panel
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	use:anchor.applyPosition={style}
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
