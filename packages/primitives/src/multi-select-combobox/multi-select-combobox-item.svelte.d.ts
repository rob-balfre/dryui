import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	textValue?: string;
	disabled?: boolean;
	icon?: Snippet;
	children: Snippet;
}
declare const MultiSelectComboboxItem: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxItem = ReturnType<typeof MultiSelectComboboxItem>;
export default MultiSelectComboboxItem;
