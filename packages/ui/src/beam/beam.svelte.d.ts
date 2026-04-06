import type { HTMLAttributes } from 'svelte/elements';
import { type BeamProps as PrimitiveBeamProps } from '@dryui/primitives/beam';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	color?: PrimitiveBeamProps['color'];
	width?: PrimitiveBeamProps['width'];
	angle?: PrimitiveBeamProps['angle'];
	speed?: PrimitiveBeamProps['speed'];
	intensity?: PrimitiveBeamProps['intensity'];
	blendMode?: PrimitiveBeamProps['blendMode'];
	children?: PrimitiveBeamProps['children'];
}
declare const Beam: import('svelte').Component<Props, {}, ''>;
type Beam = ReturnType<typeof Beam>;
export default Beam;
