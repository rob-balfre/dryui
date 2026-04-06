import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	label?: string | undefined;
}
declare const Spinner: import('svelte').Component<Props, {}, ''>;
type Spinner = ReturnType<typeof Spinner>;
export default Spinner;
