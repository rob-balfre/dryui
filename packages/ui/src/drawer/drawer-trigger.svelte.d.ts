import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DrawerTrigger: import('svelte').Component<Props, {}, ''>;
type DrawerTrigger = ReturnType<typeof DrawerTrigger>;
export default DrawerTrigger;
