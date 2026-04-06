import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGGElement> {
	strokeWidth?: number;
	showDots?: boolean;
	dotRadius?: number;
	color?: string;
}
declare const ChartArea: import('svelte').Component<Props, {}, ''>;
type ChartArea = ReturnType<typeof ChartArea>;
export default ChartArea;
