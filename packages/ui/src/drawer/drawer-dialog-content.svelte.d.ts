import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDialogElement> {
	children: Snippet;
}
declare const DrawerContent: import('svelte').Component<Props, {}, ''>;
type DrawerContent = ReturnType<typeof DrawerContent>;
export default DrawerContent;
