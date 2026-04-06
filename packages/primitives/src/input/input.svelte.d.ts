import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value?: string;
	disabled?: boolean;
	type?: string;
}
declare const Input: import('svelte').Component<Props, {}, 'value'>;
type Input = ReturnType<typeof Input>;
export default Input;
