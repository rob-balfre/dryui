import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'value'> {
	value: string;
	disabled?: boolean;
	unavailable?: boolean;
	children: Snippet;
}
declare const OptionSwatchGroupItem: import('svelte').Component<Props, {}, ''>;
type OptionSwatchGroupItem = ReturnType<typeof OptionSwatchGroupItem>;
export default OptionSwatchGroupItem;
