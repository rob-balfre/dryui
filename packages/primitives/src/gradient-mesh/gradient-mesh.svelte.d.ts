import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	colors?: readonly [string, string, string, string];
	speed?: 'slow' | 'normal' | 'fast' | number;
	interactive?: boolean;
	children?: Snippet;
}
declare const GradientMesh: import('svelte').Component<Props, {}, ''>;
type GradientMesh = ReturnType<typeof GradientMesh>;
export default GradientMesh;
