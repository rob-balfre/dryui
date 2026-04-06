import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const NavigationMenuRoot: import('svelte').Component<Props, {}, ''>;
type NavigationMenuRoot = ReturnType<typeof NavigationMenuRoot>;
export default NavigationMenuRoot;
