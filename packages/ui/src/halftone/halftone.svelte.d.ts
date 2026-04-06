import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	dotSize?: 'fine' | 'medium' | 'coarse' | number;
	angle?: number;
	color?: string;
	opacity?: number;
	children?: Snippet;
}
declare const Halftone: import('svelte').Component<Props, {}, ''>;
type Halftone = ReturnType<typeof Halftone>;
export default Halftone;
