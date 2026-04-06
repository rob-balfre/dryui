import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const NavigationMenuContent: import('svelte').Component<Props, {}, ''>;
type NavigationMenuContent = ReturnType<typeof NavigationMenuContent>;
export default NavigationMenuContent;
