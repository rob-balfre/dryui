import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const MenubarLabel: import('svelte').Component<Props, {}, ''>;
type MenubarLabel = ReturnType<typeof MenubarLabel>;
export default MenubarLabel;
