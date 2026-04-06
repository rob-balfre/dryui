import type { Snippet } from 'svelte';
import type { NotificationItem } from '@dryui/primitives';
interface Props {
	items?: NotificationItem[];
	open?: boolean;
	children: Snippet;
}
declare const NotificationCenterRoot: import('svelte').Component<Props, {}, 'open' | 'items'>;
type NotificationCenterRoot = ReturnType<typeof NotificationCenterRoot>;
export default NotificationCenterRoot;
