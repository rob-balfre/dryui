import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'children'> {
	children?: Snippet | undefined;
}
declare const BreadcrumbSeparator: import('svelte').Component<Props, {}, ''>;
type BreadcrumbSeparator = ReturnType<typeof BreadcrumbSeparator>;
export default BreadcrumbSeparator;
