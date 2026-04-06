import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	children?: Snippet;
}
declare const BreadcrumbSeparator: import('svelte').Component<Props, {}, ''>;
type BreadcrumbSeparator = ReturnType<typeof BreadcrumbSeparator>;
export default BreadcrumbSeparator;
