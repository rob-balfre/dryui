import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children?: Snippet;
}
declare const SelectableTileGroupLabel: import('svelte').Component<Props, {}, ''>;
type SelectableTileGroupLabel = ReturnType<typeof SelectableTileGroupLabel>;
export default SelectableTileGroupLabel;
