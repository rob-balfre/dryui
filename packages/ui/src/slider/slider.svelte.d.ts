import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size'> {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
}
declare const Slider: import('svelte').Component<Props, {}, 'value'>;
type Slider = ReturnType<typeof Slider>;
export default Slider;
