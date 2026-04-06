import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	active?: boolean;
	children: Snippet;
}
declare const SidebarItem: import('svelte').Component<Props, {}, ''>;
type SidebarItem = ReturnType<typeof SidebarItem>;
export default SidebarItem;
