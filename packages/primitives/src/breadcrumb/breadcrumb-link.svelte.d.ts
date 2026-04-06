import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	href?: string;
	current?: boolean;
	children: Snippet;
}
declare const BreadcrumbLink: import('svelte').Component<Props, {}, ''>;
type BreadcrumbLink = ReturnType<typeof BreadcrumbLink>;
export default BreadcrumbLink;
