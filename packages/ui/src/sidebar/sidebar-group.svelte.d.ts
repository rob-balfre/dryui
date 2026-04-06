import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const SidebarGroup: import('svelte').Component<Props, {}, ''>;
type SidebarGroup = ReturnType<typeof SidebarGroup>;
export default SidebarGroup;
