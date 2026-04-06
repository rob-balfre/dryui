import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const SegmentedControlItem: import('svelte').Component<Props, {}, ''>;
type SegmentedControlItem = ReturnType<typeof SegmentedControlItem>;
export default SegmentedControlItem;
