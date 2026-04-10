export type { ContextMenuRootProps, ContextMenuTriggerProps, ContextMenuContentProps, ContextMenuItemProps, ContextMenuSeparatorProps, ContextMenuGroupProps, ContextMenuLabelProps } from '@dryui/primitives';
import ContextMenuRoot from './context-menu-root.svelte';
import ContextMenuTrigger from './context-menu-trigger.svelte';
import ContextMenuContent from './context-menu-content.svelte';
import ContextMenuItem from './context-menu-item.svelte';
import ContextMenuSeparator from './context-menu-separator.svelte';
import ContextMenuGroup from './context-menu-group.svelte';
import ContextMenuLabel from './context-menu-label.svelte';
export declare const ContextMenu: {
    Root: typeof ContextMenuRoot;
    Trigger: typeof ContextMenuTrigger;
    Content: typeof ContextMenuContent;
    Item: typeof ContextMenuItem;
    Separator: typeof ContextMenuSeparator;
    Group: typeof ContextMenuGroup;
    Label: typeof ContextMenuLabel;
};
