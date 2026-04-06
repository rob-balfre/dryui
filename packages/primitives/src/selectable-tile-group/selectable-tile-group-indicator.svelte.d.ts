import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const SelectableTileGroupIndicator: import('svelte').Component<Props, {}, ''>;
type SelectableTileGroupIndicator = ReturnType<typeof SelectableTileGroupIndicator>;
export default SelectableTileGroupIndicator;
