import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size'> {
	value?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'default' | 'ghost';
	disabled?: boolean;
}
declare const Input: import('svelte').Component<Props, {}, 'value'>;
type Input = ReturnType<typeof Input>;
export default Input;
