import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	children: Snippet;
}
declare const ListSubheader: import('svelte').Component<Props, {}, ''>;
type ListSubheader = ReturnType<typeof ListSubheader>;
export default ListSubheader;
