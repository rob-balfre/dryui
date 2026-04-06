import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}
declare const BreadcrumbItem: import('svelte').Component<Props, {}, ''>;
type BreadcrumbItem = ReturnType<typeof BreadcrumbItem>;
export default BreadcrumbItem;
