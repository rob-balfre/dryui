import type { SVGAttributes } from 'svelte/elements';
interface Props extends Omit<SVGAttributes<SVGSVGElement>, 'fill'> {
	data: number[];
	width?: number;
	height?: number;
	color?: string;
	filled?: boolean;
	strokeWidth?: number;
	highlightLast?: boolean;
}
declare const Sparkline: import('svelte').Component<Props, {}, ''>;
type Sparkline = ReturnType<typeof Sparkline>;
export default Sparkline;
