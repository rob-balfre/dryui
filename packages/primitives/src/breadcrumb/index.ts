import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLAnchorAttributes } from 'svelte/elements';

export interface BreadcrumbRootProps extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}

export interface BreadcrumbListProps extends HTMLAttributes<HTMLOListElement> {
	children: Snippet;
}

export interface BreadcrumbItemProps extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}

export interface BreadcrumbLinkProps extends HTMLAnchorAttributes {
	href?: string;
	current?: boolean;
	children: Snippet;
}

export interface BreadcrumbSeparatorProps extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
	children?: Snippet | undefined;
}

import BreadcrumbRoot from './breadcrumb-root.svelte';
import BreadcrumbList from './breadcrumb-list.svelte';
import BreadcrumbItem from './breadcrumb-item.svelte';
import BreadcrumbLink from './breadcrumb-link.svelte';
import BreadcrumbSeparator from './breadcrumb-separator.svelte';

export const Breadcrumb: {
	Root: typeof BreadcrumbRoot;
	List: typeof BreadcrumbList;
	Item: typeof BreadcrumbItem;
	Link: typeof BreadcrumbLink;
	Separator: typeof BreadcrumbSeparator;
} = {
	Root: BreadcrumbRoot,
	List: BreadcrumbList,
	Item: BreadcrumbItem,
	Link: BreadcrumbLink,
	Separator: BreadcrumbSeparator
};
