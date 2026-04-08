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

			// Nudge panel into viewport if anchor positioning overflows
			requestAnimationFrame(() => {
				if (!panelEl) return;
				panelEl.style.translate = '';
				const rect = panelEl.getBoundingClientRect();
				const pad = 8;
				if (rect.left < pad) {
					panelEl.style.translate = `${pad - rect.left}px 0`;
				} else if (rect.right > window.innerWidth - pad) {
					panelEl.style.translate = `${window.innerWidth - pad - rect.right}px 0`;
				}
			});
		} else {
			try {
				if (panelEl.matches(':popover-open')) {
					panelEl.hidePopover();
				}
			} catch {
				// Already hidden
			}
			if (panelEl) panelEl.style.translate = '';
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

<style>
	[data-notification-center-panel] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		&:not(:popover-open) {
			display: none;
		}

		display: grid;
		grid-template-columns: min(var(--dry-nc-panel-width, 24rem), calc(100dvw - var(--dry-space-4, 1rem) * 2));
		max-height: 28rem;
		overflow-y: auto;
		background: var(--dry-color-bg-overlay, #f1f3f5);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		border-radius: var(--dry-radius-lg, 0.5rem);
		box-shadow: var(--dry-shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1));
		padding: 0;

		&:popover-open {
			opacity: 1;
			transform: scale(1);
		}

		@starting-style {
			&:popover-open {
				opacity: 0;
				transform: scale(0.95);
			}
		}

		transition:
			opacity var(--dry-duration-fast, 150ms) var(--dry-ease-out, ease-out),
			transform var(--dry-duration-fast, 150ms) var(--dry-ease-out, ease-out);
	}
</style>
