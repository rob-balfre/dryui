import type { SVGAttributes } from 'svelte/elements';
export interface SparklineProps extends Omit<SVGAttributes<SVGSVGElement>, 'fill'> {
    data: number[];
    width?: number;
    height?: number;
    color?: string;
    filled?: boolean;
    strokeWidth?: number;
    highlightLast?: boolean;
}
export { default as Sparkline } from './sparkline.svelte';
