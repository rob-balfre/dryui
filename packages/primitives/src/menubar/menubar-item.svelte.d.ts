import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	disabled?: boolean;
	onSelect?: () => void;
	children: Snippet;
}
declare const MenubarItem: import('svelte').Component<Props, {}, ''>;
type MenubarItem = ReturnType<typeof MenubarItem>;
export default MenubarItem;
