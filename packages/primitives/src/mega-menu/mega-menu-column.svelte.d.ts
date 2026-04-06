import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	children: Snippet;
}
declare const MegaMenuColumn: import('svelte').Component<Props, {}, ''>;
type MegaMenuColumn = ReturnType<typeof MegaMenuColumn>;
export default MegaMenuColumn;
