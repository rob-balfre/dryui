import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	/** Enable container-query-based responsive column collapsing. */
	responsive?: boolean;
	children: Snippet;
}
declare const Grid: import('svelte').Component<Props, {}, ''>;
type Grid = ReturnType<typeof Grid>;
export default Grid;
