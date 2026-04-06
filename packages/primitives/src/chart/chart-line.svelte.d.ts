import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGGElement> {
	strokeWidth?: number;
	showDots?: boolean;
	dotRadius?: number;
	color?: string;
}
declare const ChartLine: import('svelte').Component<Props, {}, ''>;
type ChartLine = ReturnType<typeof ChartLine>;
export default ChartLine;
