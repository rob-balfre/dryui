import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type GodRaysProps as PrimitiveGodRaysProps } from '@dryui/primitives/god-rays';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	color?: string | undefined;
	rayCount?: number | undefined;
	intensity?: number | undefined;
	center?:
		| {
				x: number;
				y: number;
		  }
		| undefined;
	speed?: number | undefined;
	blendMode?: PrimitiveGodRaysProps['blendMode'];
	children?: Snippet | undefined;
}
declare const GodRays: import('svelte').Component<Props, {}, ''>;
type GodRays = ReturnType<typeof GodRays>;
export default GodRays;
