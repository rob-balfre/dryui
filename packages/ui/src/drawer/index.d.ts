export type { DrawerRootProps, DrawerTriggerProps, DrawerContentProps, DrawerOverlayProps, DrawerHeaderProps, DrawerFooterProps, DrawerCloseProps } from '@dryui/primitives';
import type { DrawerBodyProps as PrimitiveDrawerBodyProps } from '@dryui/primitives';
export interface DrawerBodyProps extends PrimitiveDrawerBodyProps {
    padding?: boolean;
}
import DrawerRoot from './drawer-root.svelte';
import DrawerTrigger from './drawer-trigger.svelte';
import DrawerContent from './drawer-content.svelte';
import DrawerOverlay from './drawer-overlay.svelte';
import DrawerHeader from './drawer-header.svelte';
import DrawerBody from './drawer-body.svelte';
import DrawerFooter from './drawer-footer.svelte';
import DrawerClose from './drawer-close.svelte';
export declare const Drawer: {
    Root: typeof DrawerRoot;
    Trigger: typeof DrawerTrigger;
    Content: typeof DrawerContent;
    Overlay: typeof DrawerOverlay;
    Header: typeof DrawerHeader;
    Body: typeof DrawerBody;
    Footer: typeof DrawerFooter;
    Close: typeof DrawerClose;
};
