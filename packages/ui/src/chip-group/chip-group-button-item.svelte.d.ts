import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	variant?: 'solid' | 'outline' | 'soft';
	color?: 'gray' | 'blue' | 'red' | 'green' | 'yellow' | 'purple' | 'orange';
	disabled?: boolean;
	children: Snippet;
}
declare const ChipGroupItem: import('svelte').Component<Props, {}, ''>;
type ChipGroupItem = ReturnType<typeof ChipGroupItem>;
export default ChipGroupItem;
