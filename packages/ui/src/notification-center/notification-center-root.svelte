<script lang="ts">
	import type { Snippet } from 'svelte';
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

	const uid = $props.id();
	const triggerId = `nc-trigger-${uid}`;
	const panelId = `nc-panel-${uid}`;

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

<style>
	[data-notification-center-root] {
		--dry-nc-panel-width: 24rem;
		--dry-nc-item-padding: var(--dry-space-3, 0.75rem);
		--dry-nc-unread-bg: color-mix(in srgb, var(--dry-color-fill-brand) 12%, transparent);

		position: relative;
		display: inline-grid;
	}
</style>
