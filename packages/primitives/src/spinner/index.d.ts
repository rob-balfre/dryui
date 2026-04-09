import type { SVGAttributes } from 'svelte/elements';
export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
	label?: string | undefined;
}
export { default as Spinner } from './spinner.svelte';
