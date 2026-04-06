import type { HTMLAttributes } from 'svelte/elements';
import { type AdjustProps as PrimitiveAdjustProps } from '@dryui/primitives/adjust';
interface Props extends HTMLAttributes<HTMLDivElement> {
	brightness?: number | undefined;
	contrast?: number | undefined;
	saturate?: number | undefined;
	hueRotate?: number | undefined;
	grayscale?: number | undefined;
	sepia?: number | undefined;
	invert?: number | undefined;
	blur?: number | undefined;
	blendMode?: PrimitiveAdjustProps['blendMode'];
	children: PrimitiveAdjustProps['children'];
}
declare const Adjust: import('svelte').Component<Props, {}, ''>;
type Adjust = ReturnType<typeof Adjust>;
export default Adjust;
