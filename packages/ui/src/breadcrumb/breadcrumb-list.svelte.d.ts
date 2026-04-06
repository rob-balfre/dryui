import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLOListElement> {
	children: Snippet;
}
declare const BreadcrumbList: import('svelte').Component<Props, {}, ''>;
type BreadcrumbList = ReturnType<typeof BreadcrumbList>;
export default BreadcrumbList;
