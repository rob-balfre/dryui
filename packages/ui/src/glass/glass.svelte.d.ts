import type { HTMLAttributes } from 'svelte/elements';
import { type GlassProps as PrimitiveGlassProps } from '@dryui/primitives/glass';
interface Props extends HTMLAttributes<HTMLDivElement> {
	blur?: PrimitiveGlassProps['blur'];
	tint?: PrimitiveGlassProps['tint'];
	saturation?: PrimitiveGlassProps['saturation'];
	children: PrimitiveGlassProps['children'];
}
declare const Glass: import('svelte').Component<Props, {}, ''>;
type Glass = ReturnType<typeof Glass>;
export default Glass;
