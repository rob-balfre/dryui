<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fromAction } from 'svelte/attachments';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover } from '@dryui/primitives';
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

	let panelEl = $state<HTMLDivElement | null>(null);
	const triggerEl = $derived(document.getElementById(ctx.triggerId) as HTMLElement | null);

	function attachPanel(node: HTMLDivElement) {
		panelEl = node;

		return () => {
			if (panelEl === node) {
				panelEl = null;
			}
		};
	}

	function focusTrigger() {
		if (triggerEl instanceof HTMLElement) {
			triggerEl.focus();
		}
	}

	function handleClose(restoreFocus: boolean) {
		if (ctx.open) {
			ctx.close();
		}
		if (restoreFocus) {
			requestAnimationFrame(() => focusTrigger());
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape') return;
		event.preventDefault();
		event.stopPropagation();
		handleClose(true);
	}

	const popover = createAnchoredPopover({
		triggerEl: () => triggerEl,
		contentEl: () => panelEl ?? null,
		open: () => ctx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: (node) => {
			requestAnimationFrame(() => {
				node.style.translate = '';
				const rect = node.getBoundingClientRect();
				const pad = 8;
				if (rect.left < pad) {
					node.style.translate = `${pad - rect.left}px 0`;
				} else if (rect.right > window.innerWidth - pad) {
					node.style.translate = `${window.innerWidth - pad - rect.right}px 0`;
				}
			});
		},
		onAfterHide: (node) => {
			node.style.translate = '';
		}
	});
</script>

<div
	{@attach attachPanel}
	{@attach fromAction(popover.applyPosition, () => style)}
	id={ctx.panelId}
	popover="auto"
	role="region"
	aria-label="Notifications"
	data-notification-center-panel
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	ontoggle={(e) => {
		const event = /** @type {ToggleEvent} */ (e);
		if (event.newState === 'open') {
			ctx.show();
		} else {
			const restoreFocus =
				panelEl instanceof HTMLElement &&
				document.activeElement instanceof HTMLElement &&
				panelEl.contains(document.activeElement);
			handleClose(restoreFocus);
		}
	}}
	onkeydown={handleKeydown}
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
		grid-template-columns: min(
			var(--dry-nc-panel-width, 24rem),
			calc(100dvw - var(--dry-space-4, 1rem) * 2)
		);
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
