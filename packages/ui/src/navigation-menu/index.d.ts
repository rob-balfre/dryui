import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
export interface NavigationMenuRootProps extends HTMLAttributes<HTMLElement> {
    children: Snippet;
}
export interface NavigationMenuListProps extends HTMLAttributes<HTMLUListElement> {
    children: Snippet;
}
export interface NavigationMenuItemProps {
    children: Snippet;
}
export interface NavigationMenuTriggerProps extends HTMLButtonAttributes {
    children: Snippet;
}
export interface NavigationMenuContentProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface NavigationMenuLinkProps extends HTMLAnchorAttributes {
    active?: boolean;
    children: Snippet;
}
import NavigationMenuRoot from './navigation-menu-root.svelte';
import NavigationMenuList from './navigation-menu-list.svelte';
import NavigationMenuItem from './navigation-menu-item.svelte';
import NavigationMenuTrigger from './navigation-menu-trigger-button.svelte';
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
