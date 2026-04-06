import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	id: string;
	read?: boolean;
	timestamp?: Date;
	variant?: 'info' | 'warning' | 'critical';
	action?: Snippet;
	children: Snippet;
}
declare const NotificationCenterItem: import('svelte').Component<Props, {}, ''>;
type NotificationCenterItem = ReturnType<typeof NotificationCenterItem>;
export default NotificationCenterItem;
