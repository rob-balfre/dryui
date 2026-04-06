export type { AlertVariant } from './context.svelte.js';
export type {
	AlertRootProps,
	AlertIconProps,
	AlertTitleProps,
	AlertDescriptionProps,
	AlertCloseProps
} from '@dryui/primitives';

import AlertRoot from './alert-root.svelte';
import AlertIcon from './alert-icon.svelte';
import AlertTitle from './alert-title.svelte';
import AlertDescription from './alert-description.svelte';
import AlertClose from './alert-close.svelte';

export const Alert: {
	Root: typeof AlertRoot;
	Icon: typeof AlertIcon;
	Title: typeof AlertTitle;
	Description: typeof AlertDescription;
	Close: typeof AlertClose;
} = {
	Root: AlertRoot,
	Icon: AlertIcon,
	Title: AlertTitle,
	Description: AlertDescription,
	Close: AlertClose
};
