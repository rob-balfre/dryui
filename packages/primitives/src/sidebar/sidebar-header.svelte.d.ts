import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const SidebarHeader: import('svelte').Component<Props, {}, ''>;
type SidebarHeader = ReturnType<typeof SidebarHeader>;
export default SidebarHeader;
