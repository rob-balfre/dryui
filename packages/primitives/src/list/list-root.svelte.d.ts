import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLUListElement> {
	dense?: boolean;
	disablePadding?: boolean;
	children: Snippet;
}
declare const ListRoot: import('svelte').Component<Props, {}, ''>;
type ListRoot = ReturnType<typeof ListRoot>;
export default ListRoot;
