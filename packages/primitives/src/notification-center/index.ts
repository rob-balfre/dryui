import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';

export type { NotificationItem, NotificationCenterContext } from './context.svelte.js';

export interface NotificationCenterRootProps {
	items?: import('./context.svelte.js').NotificationItem[];
	open?: boolean;
	children: Snippet;
}

export interface NotificationCenterTriggerProps extends Omit<HTMLButtonAttributes, 'children'> {
	children: Snippet<[{ unreadCount: number }]>;
}

export interface NotificationCenterPanelProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	children: Snippet;
}

export interface NotificationCenterItemProps extends HTMLAttributes<HTMLDivElement> {
	id: string;
	read?: boolean;
	timestamp?: Date;
	variant?: 'info' | 'warning' | 'critical';
	action?: Snippet;
	children: Snippet;
}

export interface NotificationCenterGroupProps extends HTMLAttributes<HTMLDivElement> {
	label: string;
	children: Snippet;
}

import NotificationCenterRoot from './notification-center-root.svelte';
import NotificationCenterTrigger from './notification-center-trigger.svelte';
import NotificationCenterPanel from './notification-center-panel.svelte';
import NotificationCenterItem from './notification-center-item.svelte';
import NotificationCenterGroup from './notification-center-group.svelte';

export const NotificationCenter: {
	Root: typeof NotificationCenterRoot;
	Trigger: typeof NotificationCenterTrigger;
	Panel: typeof NotificationCenterPanel;
	Item: typeof NotificationCenterItem;
	Group: typeof NotificationCenterGroup;
} = {
	Root: NotificationCenterRoot,
	Trigger: NotificationCenterTrigger,
	Panel: NotificationCenterPanel,
	Item: NotificationCenterItem,
	Group: NotificationCenterGroup
};
