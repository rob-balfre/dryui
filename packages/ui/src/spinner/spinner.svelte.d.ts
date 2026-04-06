import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	size?: 'sm' | 'md' | 'lg';
	color?: 'primary' | 'current';
	label?: string;
}
declare const Spinner: import('svelte').Component<Props, {}, ''>;
type Spinner = ReturnType<typeof Spinner>;
export default Spinner;
