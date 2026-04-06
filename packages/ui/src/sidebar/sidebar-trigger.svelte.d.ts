import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const SidebarTrigger: import('svelte').Component<Props, {}, ''>;
type SidebarTrigger = ReturnType<typeof SidebarTrigger>;
export default SidebarTrigger;
