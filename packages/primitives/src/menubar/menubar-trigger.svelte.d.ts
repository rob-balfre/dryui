import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const MenubarTrigger: import('svelte').Component<Props, {}, ''>;
type MenubarTrigger = ReturnType<typeof MenubarTrigger>;
export default MenubarTrigger;
