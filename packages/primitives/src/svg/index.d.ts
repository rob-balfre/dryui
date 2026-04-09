import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
export interface SvgProps extends SVGAttributes<SVGSVGElement> {
	children?: Snippet;
	viewBox?: string;
	'aria-label'?: string;
}
export { default as Svg } from './svg.svelte';
