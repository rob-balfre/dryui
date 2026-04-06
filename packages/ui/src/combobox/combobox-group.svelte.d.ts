import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	label: string;
	children: Snippet;
}
declare const ComboboxGroup: import('svelte').Component<Props, {}, ''>;
type ComboboxGroup = ReturnType<typeof ComboboxGroup>;
export default ComboboxGroup;
