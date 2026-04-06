import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children?: Snippet;
}
declare const SelectableTileGroupMeta: import('svelte').Component<Props, {}, ''>;
type SelectableTileGroupMeta = ReturnType<typeof SelectableTileGroupMeta>;
export default SelectableTileGroupMeta;
