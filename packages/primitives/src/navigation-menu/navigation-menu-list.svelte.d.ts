import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLUListElement> {
	children: Snippet;
}
declare const NavigationMenuList: import('svelte').Component<Props, {}, ''>;
type NavigationMenuList = ReturnType<typeof NavigationMenuList>;
export default NavigationMenuList;
