export type {
	SidebarRootProps,
	SidebarHeaderProps,
	SidebarContentProps,
	SidebarFooterProps,
	SidebarGroupProps,
	SidebarGroupLabelProps,
	SidebarItemProps,
	SidebarTriggerProps
} from '@dryui/primitives';
import SidebarRoot from './sidebar-root.svelte';
import SidebarHeader from './sidebar-header.svelte';
import SidebarContent from './sidebar-content.svelte';
import SidebarFooter from './sidebar-footer.svelte';
import SidebarGroup from './sidebar-group.svelte';
import SidebarGroupLabel from './sidebar-group-label.svelte';
import SidebarItem from './sidebar-item.svelte';
import SidebarTrigger from './sidebar-trigger.svelte';
export declare const Sidebar: {
	Root: typeof SidebarRoot;
	Header: typeof SidebarHeader;
	Content: typeof SidebarContent;
	Footer: typeof SidebarFooter;
	Group: typeof SidebarGroup;
	GroupLabel: typeof SidebarGroupLabel;
	Item: typeof SidebarItem;
	Trigger: typeof SidebarTrigger;
};
