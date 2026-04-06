import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}
declare const ToggleGroupItem: import('svelte').Component<Props, {}, ''>;
type ToggleGroupItem = ReturnType<typeof ToggleGroupItem>;
export default ToggleGroupItem;
