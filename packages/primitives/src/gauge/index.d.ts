import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
export interface GaugeProps extends SVGAttributes<SVGSVGElement> {
	value: number;
	min?: number;
	max?: number;
	startAngle?: number;
	endAngle?: number;
	thresholds?: {
		value: number;
		color: string;
	}[];
	label?: Snippet<
		[
			{
				value: number;
				percentage: number;
			}
		]
	>;
	children?: Snippet;
}
export { default as Gauge } from './gauge.svelte';
