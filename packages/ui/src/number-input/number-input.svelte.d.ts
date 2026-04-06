import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size'> {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
}
declare const NumberInput: import('svelte').Component<Props, {}, 'value'>;
type NumberInput = ReturnType<typeof NumberInput>;
export default NumberInput;
