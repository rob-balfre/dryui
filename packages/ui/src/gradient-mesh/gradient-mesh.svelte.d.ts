import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type GradientMeshProps as PrimitiveGradientMeshProps } from '@dryui/primitives/gradient-mesh';
interface Props extends HTMLAttributes<HTMLDivElement> {
	colors?: PrimitiveGradientMeshProps['colors'];
	speed?: PrimitiveGradientMeshProps['speed'];
	interactive?: PrimitiveGradientMeshProps['interactive'];
	children: Snippet;
}
declare const GradientMesh: import('svelte').Component<Props, {}, ''>;
type GradientMesh = ReturnType<typeof GradientMesh>;
export default GradientMesh;
