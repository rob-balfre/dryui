import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	external?: boolean;
	disabled?: boolean;
	underline?: 'always' | 'hover' | 'none';
	children: Snippet;
}
declare const Link: import('svelte').Component<Props, {}, ''>;
type Link = ReturnType<typeof Link>;
export default Link;
