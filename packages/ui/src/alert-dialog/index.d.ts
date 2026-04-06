export type {
	AlertDialogRootProps,
	AlertDialogTriggerProps,
	AlertDialogContentProps,
	AlertDialogOverlayProps,
	AlertDialogHeaderProps,
	AlertDialogBodyProps,
	AlertDialogFooterProps,
	AlertDialogActionProps,
	AlertDialogCancelProps
} from '@dryui/primitives';
import AlertDialogRoot from './alert-dialog-root.svelte';
import AlertDialogTrigger from './alert-dialog-trigger.svelte';
import AlertDialogContent from './alert-dialog-content.svelte';
import AlertDialogOverlay from './alert-dialog-overlay.svelte';
import AlertDialogHeader from './alert-dialog-header.svelte';
import AlertDialogBody from './alert-dialog-body.svelte';
import AlertDialogFooter from './alert-dialog-footer.svelte';
import AlertDialogAction from './alert-dialog-action.svelte';
import AlertDialogCancel from './alert-dialog-cancel.svelte';
export declare const AlertDialog: {
	Root: typeof AlertDialogRoot;
	Trigger: typeof AlertDialogTrigger;
	Content: typeof AlertDialogContent;
	Overlay: typeof AlertDialogOverlay;
	Header: typeof AlertDialogHeader;
	Body: typeof AlertDialogBody;
	Footer: typeof AlertDialogFooter;
	Action: typeof AlertDialogAction;
	Cancel: typeof AlertDialogCancel;
};
