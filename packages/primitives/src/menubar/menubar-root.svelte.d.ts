import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const MenubarRoot: import('svelte').Component<Props, {}, ''>;
type MenubarRoot = ReturnType<typeof MenubarRoot>;
export default MenubarRoot;
