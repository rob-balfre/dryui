import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	label?: string | undefined;
}
declare const MultiSelectComboboxSelectionRemove: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxSelectionRemove = ReturnType<typeof MultiSelectComboboxSelectionRemove>;
export default MultiSelectComboboxSelectionRemove;
