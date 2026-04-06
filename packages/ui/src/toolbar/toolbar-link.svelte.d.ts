import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	href: string;
	children: Snippet;
}
declare const ToolbarLink: import('svelte').Component<Props, {}, ''>;
type ToolbarLink = ReturnType<typeof ToolbarLink>;
export default ToolbarLink;
