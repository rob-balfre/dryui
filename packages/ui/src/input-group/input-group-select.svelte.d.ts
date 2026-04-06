import type { HTMLSelectAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLSelectAttributes {
	value?: string;
	children?: Snippet;
}
declare const InputGroupSelect: import('svelte').Component<Props, {}, 'value'>;
type InputGroupSelect = ReturnType<typeof InputGroupSelect>;
export default InputGroupSelect;
