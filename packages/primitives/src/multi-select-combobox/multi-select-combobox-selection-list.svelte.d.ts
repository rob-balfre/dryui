import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const MultiSelectComboboxSelectionList: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxSelectionList = ReturnType<typeof MultiSelectComboboxSelectionList>;
export default MultiSelectComboboxSelectionList;
