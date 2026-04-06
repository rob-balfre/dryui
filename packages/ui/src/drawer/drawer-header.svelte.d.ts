import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DrawerHeader: import('svelte').Component<Props, {}, ''>;
type DrawerHeader = ReturnType<typeof DrawerHeader>;
export default DrawerHeader;
