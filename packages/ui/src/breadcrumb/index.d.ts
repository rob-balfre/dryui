export type {
	BreadcrumbRootProps,
	BreadcrumbListProps,
	BreadcrumbItemProps,
	BreadcrumbLinkProps,
	BreadcrumbSeparatorProps
} from '@dryui/primitives';
import BreadcrumbRoot from './breadcrumb-root.svelte';
import BreadcrumbList from './breadcrumb-list.svelte';
import BreadcrumbItem from './breadcrumb-item.svelte';
import BreadcrumbLink from './breadcrumb-link.svelte';
import BreadcrumbSeparator from './breadcrumb-separator.svelte';
export declare const Breadcrumb: {
	Root: typeof BreadcrumbRoot;
	List: typeof BreadcrumbList;
	Item: typeof BreadcrumbItem;
	Link: typeof BreadcrumbLink;
	Separator: typeof BreadcrumbSeparator;
};
