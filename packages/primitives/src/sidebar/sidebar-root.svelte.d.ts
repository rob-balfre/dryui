import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	collapsed?: boolean;
	side?: 'left' | 'right';
	children: Snippet;
}
declare const SidebarRoot: import('svelte').Component<Props, {}, 'collapsed'>;
type SidebarRoot = ReturnType<typeof SidebarRoot>;
export default SidebarRoot;
