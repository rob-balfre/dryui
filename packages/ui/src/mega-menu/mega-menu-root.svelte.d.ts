import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const MegaMenuRoot: import('svelte').Component<Props, {}, ''>;
type MegaMenuRoot = ReturnType<typeof MegaMenuRoot>;
export default MegaMenuRoot;
