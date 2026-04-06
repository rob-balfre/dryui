import type { SVGAttributes } from 'svelte/elements';
import { type ChartStackedDataPoint } from '@dryui/primitives';
interface Props extends SVGAttributes<SVGGElement> {
	stackedData: ChartStackedDataPoint[];
	radius?: number;
}
declare const ChartStackedBar: import('svelte').Component<Props, {}, ''>;
type ChartStackedBar = ReturnType<typeof ChartStackedBar>;
export default ChartStackedBar;
