export type {
	NotificationItem,
	NotificationCenterRootProps,
	NotificationCenterTriggerProps,
	NotificationCenterPanelProps,
	NotificationCenterItemProps,
	NotificationCenterGroupProps
} from '@dryui/primitives';

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
