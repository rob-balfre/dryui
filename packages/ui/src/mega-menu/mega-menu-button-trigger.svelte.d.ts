import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const MegaMenuTrigger: import('svelte').Component<Props, {}, ''>;
type MegaMenuTrigger = ReturnType<typeof MegaMenuTrigger>;
export default MegaMenuTrigger;
