import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	value?: string;
	disabled?: boolean;
	name?: string;
	children: Snippet;
}
declare const ComboboxRoot: import('svelte').Component<Props, {}, 'value' | 'open'>;
type ComboboxRoot = ReturnType<typeof ComboboxRoot>;
export default ComboboxRoot;
