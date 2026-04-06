import type { HTMLAttributes } from 'svelte/elements';
import { type SpotlightProps as PrimitiveSpotlightProps } from '@dryui/primitives/spotlight';
interface Props extends HTMLAttributes<HTMLDivElement> {
	radius?: PrimitiveSpotlightProps['radius'];
	intensity?: PrimitiveSpotlightProps['intensity'];
	color?: PrimitiveSpotlightProps['color'];
	followPointer?: PrimitiveSpotlightProps['followPointer'];
	blendMode?: PrimitiveSpotlightProps['blendMode'];
	children: PrimitiveSpotlightProps['children'];
}
declare const Spotlight: import('svelte').Component<Props, {}, ''>;
type Spotlight = ReturnType<typeof Spotlight>;
export default Spotlight;
