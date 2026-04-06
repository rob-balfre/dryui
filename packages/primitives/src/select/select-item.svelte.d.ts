import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const SelectItem: import('svelte').Component<Props, {}, ''>;
type SelectItem = ReturnType<typeof SelectItem>;
export default SelectItem;
