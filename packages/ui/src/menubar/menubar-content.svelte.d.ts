import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	placement?: 'bottom' | 'bottom-start' | 'bottom-end';
	offset?: number;
	children: Snippet;
}
declare const MenubarContent: import('svelte').Component<Props, {}, ''>;
type MenubarContent = ReturnType<typeof MenubarContent>;
export default MenubarContent;
