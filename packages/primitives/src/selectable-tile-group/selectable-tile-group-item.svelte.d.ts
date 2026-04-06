import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'value'> {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const SelectableTileGroupItem: import('svelte').Component<Props, {}, ''>;
type SelectableTileGroupItem = ReturnType<typeof SelectableTileGroupItem>;
export default SelectableTileGroupItem;
