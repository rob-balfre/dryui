import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	primary?: Snippet;
	secondary?: Snippet;
	children?: Snippet;
}
declare const ListItemText: import('svelte').Component<Props, {}, ''>;
type ListItemText = ReturnType<typeof ListItemText>;
export default ListItemText;
