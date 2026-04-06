import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
	value: string;
	children?: Snippet | undefined;
}
declare const MultiSelectComboboxSelectionItem: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxSelectionItem = ReturnType<typeof MultiSelectComboboxSelectionItem>;
export default MultiSelectComboboxSelectionItem;
