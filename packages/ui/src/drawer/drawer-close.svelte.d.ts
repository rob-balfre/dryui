import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const DrawerClose: import('svelte').Component<Props, {}, ''>;
type DrawerClose = ReturnType<typeof DrawerClose>;
export default DrawerClose;
