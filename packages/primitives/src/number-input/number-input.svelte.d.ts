import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
}
declare const NumberInput: import('svelte').Component<Props, {}, 'value'>;
type NumberInput = ReturnType<typeof NumberInput>;
export default NumberInput;
