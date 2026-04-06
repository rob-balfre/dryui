import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	interactive?: boolean;
	disabled?: boolean;
	children: Snippet;
}
declare const ListItem: import('svelte').Component<Props, {}, ''>;
type ListItem = ReturnType<typeof ListItem>;
export default ListItem;
