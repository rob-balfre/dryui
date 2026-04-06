import { createContext } from '../utils/create-context.js';

export interface NotificationItem {
	id: string;
	read?: boolean;
	timestamp?: Date;
	variant?: 'info' | 'warning' | 'critical';
}

export interface NotificationCenterContext {
	readonly items: NotificationItem[];
	readonly unreadCount: number;
	readonly open: boolean;
	readonly triggerId: string;
	readonly panelId: string;
	triggerEl: HTMLElement | null;
	markAllRead: () => void;
	markRead: (id: string) => void;
	remove: (id: string) => void;
	toggle: () => void;
	show: () => void;
	close: () => void;
}
export const [setNotificationCenterCtx, getNotificationCenterCtx] =
	createContext<NotificationCenterContext>('notification-center');
