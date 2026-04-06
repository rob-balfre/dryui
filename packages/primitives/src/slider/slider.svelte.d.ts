import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
}
declare const Slider: import('svelte').Component<Props, {}, 'value'>;
type Slider = ReturnType<typeof Slider>;
export default Slider;
