import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	placeholder?: string;
}
declare const MultiSelectComboboxInput: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxInput = ReturnType<typeof MultiSelectComboboxInput>;
export default MultiSelectComboboxInput;
