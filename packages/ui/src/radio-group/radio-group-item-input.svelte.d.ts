import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value: string;
	disabled?: boolean;
	children?: Snippet;
}
declare const RadioGroupItem: import('svelte').Component<Props, {}, ''>;
type RadioGroupItem = ReturnType<typeof RadioGroupItem>;
export default RadioGroupItem;
