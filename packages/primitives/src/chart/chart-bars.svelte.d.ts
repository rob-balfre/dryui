import type { SVGAttributes } from 'svelte/elements';
interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
	radius?: number;
	onclick?: (event: { label: string; value: number; index: number }) => void;
}
declare const ChartBars: import('svelte').Component<Props, {}, ''>;
type ChartBars = ReturnType<typeof ChartBars>;
export default ChartBars;
