import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const ListboxItem: import('svelte').Component<Props, {}, ''>;
type ListboxItem = ReturnType<typeof ListboxItem>;
export default ListboxItem;
