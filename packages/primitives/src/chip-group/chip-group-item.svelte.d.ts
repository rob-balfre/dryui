import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const ChipGroupItem: import('svelte').Component<Props, {}, ''>;
type ChipGroupItem = ReturnType<typeof ChipGroupItem>;
export default ChipGroupItem;
