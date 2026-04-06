<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setNotificationCenterCtx, type NotificationItem } from './context.svelte.js';

	interface Props {
		items?: NotificationItem[];
		open?: boolean;
		children: Snippet;
	}

	let {
		items = $bindable<NotificationItem[]>([]),
		open = $bindable(false),
		children
	}: Props = $props();

	const triggerId = generateFormId('nc-trigger');
	const panelId = generateFormId('nc-panel');

	const unreadCount = $derived(items.filter((item) => !item.read).length);

	setNotificationCenterCtx({
		get items() {
			return items;
		},
		get unreadCount() {
			return unreadCount;
		},
		get open() {
			return open;
		},
		get triggerId() {
			return triggerId;
		},
		get panelId() {
			return panelId;
		},
		triggerEl: null,
		markAllRead() {
			items = items.map((item) => ({ ...item, read: true }));
		},
		markRead(id: string) {
			items = items.map((item) => (item.id === id ? { ...item, read: true } : item));
		},
		remove(id: string) {
			items = items.filter((item) => item.id !== id);
		},
		toggle() {
			open = !open;
		},
		show() {
			open = true;
		},
		close() {
			open = false;
		}
	});
</script>

<div data-notification-center-root>
	{@render children()}
</div>

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-notification-center-root] {
		position: relative;
		display: inline-grid;
	}

	[data-notification-center-panel] {
		--dry-nc-panel-width: 24rem;
		--dry-nc-item-padding: var(--dry-space-3, 0.75rem);
		--dry-nc-unread-bg: var(--dry-color-fill-brand-weak);

		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		display: grid;
		grid-template-columns: var(--dry-nc-panel-width);
		max-height: 28rem;
		overflow-y: auto;
		background: var(--dry-color-bg-raised, #ffffff);
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

	[data-notification-center-item] {
		padding: var(--dry-nc-item-padding, 0.75rem);
		border-bottom: 1px solid var(--dry-color-stroke-weak, #e2e8f0);
		transition: background var(--dry-duration-fast, 100ms) ease;
	}

	[data-notification-center-item]:last-child {
		border-bottom: none;
	}

	[data-notification-center-item][data-state='unread'] {
		background: var(--dry-nc-unread-bg, #eff6ff);
	}

	[data-notification-center-item][data-variant='warning'] {
		border-left: 3px solid var(--dry-color-fill-warning);
	}

	[data-notification-center-item][data-variant='critical'] {
		border-left: 3px solid var(--dry-color-fill-error);
	}

	[data-notification-center-item][data-variant='info'] {
		border-left: 3px solid var(--dry-color-fill-brand);
	}

	[data-notification-center-group] [data-part='group-header'] {
		padding: var(--dry-space-2, 0.5rem) var(--dry-nc-item-padding, 0.75rem);
		font-size: var(--dry-type-ui-caption-size, var(--dry-text-xs-size, 0.75rem));
		font-weight: 600;
		color: var(--dry-color-text-weak, #64748b);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--dry-color-fill, #f8fafc);
	}

	[data-notification-center-trigger] {
		position: relative;
	}

	[data-theme='dark'] [data-notification-center-panel] {
		background: var(--dry-color-bg-raised, #1e1e2e);
	}

	[data-theme='dark'] [data-notification-center-item][data-state='unread'] {
		background: rgba(59, 130, 246, 0.1);
	}
</style>
