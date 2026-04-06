import type { Snippet } from 'svelte';
import { type NotificationItem } from './context.svelte.js';
interface Props {
	items?: NotificationItem[];
	open?: boolean;
	children: Snippet;
}
declare const NotificationCenterRoot: import('svelte').Component<Props, {}, 'open' | 'items'>;
type NotificationCenterRoot = ReturnType<typeof NotificationCenterRoot>;
export default NotificationCenterRoot;
