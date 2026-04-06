import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	icon?: Snippet;
	description?: Snippet;
	children: Snippet;
}
declare const MegaMenuLink: import('svelte').Component<Props, {}, ''>;
type MegaMenuLink = ReturnType<typeof MegaMenuLink>;
export default MegaMenuLink;
