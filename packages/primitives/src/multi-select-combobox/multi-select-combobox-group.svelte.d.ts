import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	label: string;
	children: Snippet;
}
declare const MultiSelectComboboxGroup: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxGroup = ReturnType<typeof MultiSelectComboboxGroup>;
export default MultiSelectComboboxGroup;
