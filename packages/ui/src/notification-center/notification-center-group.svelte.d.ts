import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	label: string;
	children: Snippet;
}
declare const NotificationCenterGroup: import('svelte').Component<Props, {}, ''>;
type NotificationCenterGroup = ReturnType<typeof NotificationCenterGroup>;
export default NotificationCenterGroup;
