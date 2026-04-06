import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGGElement> {
	ticks?: number;
}
declare const ChartYAxis: import('svelte').Component<Props, {}, ''>;
type ChartYAxis = ReturnType<typeof ChartYAxis>;
export default ChartYAxis;
