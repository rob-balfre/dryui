import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	padding?: boolean;
}
declare const DrawerBody: import('svelte').Component<Props, {}, ''>;
type DrawerBody = ReturnType<typeof DrawerBody>;
export default DrawerBody;
