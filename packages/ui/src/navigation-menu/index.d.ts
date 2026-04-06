export type {
	NavigationMenuRootProps,
	NavigationMenuListProps,
	NavigationMenuItemProps,
	NavigationMenuTriggerProps,
	NavigationMenuContentProps,
	NavigationMenuLinkProps
} from '@dryui/primitives';
import NavigationMenuRoot from './navigation-menu-root.svelte';
import NavigationMenuList from './navigation-menu-list.svelte';
import NavigationMenuItem from './navigation-menu-item.svelte';
import NavigationMenuTrigger from './navigation-menu-trigger.svelte';
import NavigationMenuContent from './navigation-menu-content.svelte';
import NavigationMenuLink from './navigation-menu-link.svelte';
export declare const NavigationMenu: {
	Root: typeof NavigationMenuRoot;
	List: typeof NavigationMenuList;
	Item: typeof NavigationMenuItem;
	Trigger: typeof NavigationMenuTrigger;
	Content: typeof NavigationMenuContent;
	Link: typeof NavigationMenuLink;
};
