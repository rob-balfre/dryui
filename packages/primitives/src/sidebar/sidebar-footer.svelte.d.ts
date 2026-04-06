import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const SidebarFooter: import('svelte').Component<Props, {}, ''>;
type SidebarFooter = ReturnType<typeof SidebarFooter>;
export default SidebarFooter;
