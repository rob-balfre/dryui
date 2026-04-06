import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	shape?: 'wave' | 'curve' | 'angle' | 'zigzag';
	flip?: boolean;
	color?: string;
	height?: number;
}
declare const WaveDivider: import('svelte').Component<Props, {}, ''>;
type WaveDivider = ReturnType<typeof WaveDivider>;
export default WaveDivider;
