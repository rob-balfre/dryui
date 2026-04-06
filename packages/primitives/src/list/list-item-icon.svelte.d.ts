import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ListItemIcon: import('svelte').Component<Props, {}, ''>;
type ListItemIcon = ReturnType<typeof ListItemIcon>;
export default ListItemIcon;
