import type { HTMLAttributes } from 'svelte/elements';
import { type RevealProps as PrimitiveRevealProps } from '@dryui/primitives/reveal';
interface Props extends HTMLAttributes<HTMLDivElement> {
	variant?: PrimitiveRevealProps['variant'];
	once?: PrimitiveRevealProps['once'];
	threshold?: PrimitiveRevealProps['threshold'];
	delay?: PrimitiveRevealProps['delay'];
	duration?: PrimitiveRevealProps['duration'];
	distance?: PrimitiveRevealProps['distance'];
	children: PrimitiveRevealProps['children'];
}
declare const Reveal: import('svelte').Component<Props, {}, ''>;
type Reveal = ReturnType<typeof Reveal>;
export default Reveal;
