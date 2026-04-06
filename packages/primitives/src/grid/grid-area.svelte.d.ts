import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const GridArea: import('svelte').Component<Props, {}, ''>;
type GridArea = ReturnType<typeof GridArea>;
export default GridArea;
