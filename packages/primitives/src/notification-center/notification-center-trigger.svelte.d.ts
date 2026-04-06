import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	children: Snippet<
		[
			{
				unreadCount: number;
			}
		]
	>;
}
declare const NotificationCenterTrigger: import('svelte').Component<Props, {}, ''>;
type NotificationCenterTrigger = ReturnType<typeof NotificationCenterTrigger>;
export default NotificationCenterTrigger;
