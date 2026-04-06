import type { HTMLAttributes } from 'svelte/elements';
import { type GlowProps as PrimitiveGlowProps } from '@dryui/primitives/glow';
interface Props extends HTMLAttributes<HTMLDivElement> {
	color?: PrimitiveGlowProps['color'];
	intensity?: PrimitiveGlowProps['intensity'];
	radius?: PrimitiveGlowProps['radius'];
	blendMode?: PrimitiveGlowProps['blendMode'];
	children: PrimitiveGlowProps['children'];
}
declare const Glow: import('svelte').Component<Props, {}, ''>;
type Glow = ReturnType<typeof Glow>;
export default Glow;
