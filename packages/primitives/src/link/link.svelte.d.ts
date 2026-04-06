import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	external?: boolean;
	disabled?: boolean;
	children: Snippet;
}
declare const Link: import('svelte').Component<Props, {}, ''>;
type Link = ReturnType<typeof Link>;
export default Link;
