import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const BreadcrumbRoot: import('svelte').Component<Props, {}, ''>;
type BreadcrumbRoot = ReturnType<typeof BreadcrumbRoot>;
export default BreadcrumbRoot;
