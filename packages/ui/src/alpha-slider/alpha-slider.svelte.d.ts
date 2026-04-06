import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: number;
	color?: string;
	min?: number;
	max?: number;
	step?: number;
	onchange?: (value: number) => void;
}
declare const AlphaSlider: import('svelte').Component<Props, {}, 'value'>;
type AlphaSlider = ReturnType<typeof AlphaSlider>;
export default AlphaSlider;
