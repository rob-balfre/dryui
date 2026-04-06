import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	opacity?: number;
	blend?: 'soft-light' | 'overlay' | 'multiply';
	animated?: boolean;
	grain?: 'fine' | 'medium' | 'coarse';
	children?: Snippet;
}
declare const Noise: import('svelte').Component<Props, {}, ''>;
type Noise = ReturnType<typeof Noise>;
export default Noise;
