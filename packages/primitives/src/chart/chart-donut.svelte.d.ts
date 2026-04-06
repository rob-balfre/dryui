import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
interface Props extends Omit<SVGAttributes<SVGGElement>, 'onclick'> {
	innerRadius?: number;
	outerRadius?: number;
	label?: Snippet<[{ total: number }]>;
	onclick?: (event: { label: string; value: number; index: number }) => void;
}
declare const ChartDonut: import('svelte').Component<Props, {}, ''>;
type ChartDonut = ReturnType<typeof ChartDonut>;
export default ChartDonut;
