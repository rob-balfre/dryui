import type { SVGAttributes } from 'svelte/elements';
export interface SpinnerProps extends SVGAttributes<SVGSVGElement> {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'current';
    label?: string;
}
export { default as Spinner } from './spinner.svelte';
