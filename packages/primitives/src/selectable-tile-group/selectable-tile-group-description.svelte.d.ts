import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const SelectableTileGroupDescription: import('svelte').Component<Props, {}, ''>;
type SelectableTileGroupDescription = ReturnType<typeof SelectableTileGroupDescription>;
export default SelectableTileGroupDescription;
