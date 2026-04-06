import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGGElement> {
	radius?: number;
}
declare const ChartHorizontalBar: import('svelte').Component<Props, {}, ''>;
type ChartHorizontalBar = ReturnType<typeof ChartHorizontalBar>;
export default ChartHorizontalBar;
