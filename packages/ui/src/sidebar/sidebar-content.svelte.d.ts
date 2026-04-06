import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const SidebarContent: import('svelte').Component<Props, {}, ''>;
type SidebarContent = ReturnType<typeof SidebarContent>;
export default SidebarContent;
