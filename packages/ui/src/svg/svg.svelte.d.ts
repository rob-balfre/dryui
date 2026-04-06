import type { Snippet } from 'svelte';
import type { SVGAttributes } from 'svelte/elements';
interface Props extends SVGAttributes<SVGSVGElement> {
	children?: Snippet;
	viewBox?: string;
	'aria-label'?: string;
	class?: string;
}
declare const Svg: import('svelte').Component<Props, {}, ''>;
type Svg = ReturnType<typeof Svg>;
export default Svg;
