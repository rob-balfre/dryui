import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string[];
	query?: string;
	open?: boolean;
	disabled?: boolean;
	name?: string;
	maxSelections?: number;
	onvaluechange?: (value: string[]) => void;
	onquerychange?: (query: string) => void;
	children: Snippet;
}
declare const MultiSelectComboboxRoot: import('svelte').Component<
	Props,
	{},
	'value' | 'open' | 'query'
>;
type MultiSelectComboboxRoot = ReturnType<typeof MultiSelectComboboxRoot>;
export default MultiSelectComboboxRoot;
