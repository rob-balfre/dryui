import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	index: number;
	disabled?: boolean;
	icon?: Snippet;
	children: Snippet;
}
declare const ComboboxItem: import('svelte').Component<Props, {}, ''>;
type ComboboxItem = ReturnType<typeof ComboboxItem>;
export default ComboboxItem;
