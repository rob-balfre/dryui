import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DrawerFooter: import('svelte').Component<Props, {}, ''>;
type DrawerFooter = ReturnType<typeof DrawerFooter>;
export default DrawerFooter;
