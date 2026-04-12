import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const NavigationMenuTrigger: import('svelte').Component<Props, {}, ''>;
type NavigationMenuTrigger = ReturnType<typeof NavigationMenuTrigger>;
export default NavigationMenuTrigger;
