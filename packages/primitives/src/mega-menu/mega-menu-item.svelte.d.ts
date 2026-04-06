import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const MegaMenuItem: import('svelte').Component<Props, {}, ''>;
type MegaMenuItem = ReturnType<typeof MegaMenuItem>;
export default MegaMenuItem;
