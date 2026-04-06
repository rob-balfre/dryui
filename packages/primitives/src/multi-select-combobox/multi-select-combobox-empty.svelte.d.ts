import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const MultiSelectComboboxEmpty: import('svelte').Component<Props, {}, ''>;
type MultiSelectComboboxEmpty = ReturnType<typeof MultiSelectComboboxEmpty>;
export default MultiSelectComboboxEmpty;
