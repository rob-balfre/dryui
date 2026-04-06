import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	active?: boolean;
	children: Snippet;
}
declare const NavigationMenuLink: import('svelte').Component<Props, {}, ''>;
type NavigationMenuLink = ReturnType<typeof NavigationMenuLink>;
export default NavigationMenuLink;
