import type { HTMLAttributes } from 'svelte/elements';
import { type ChromaticAberrationProps as PrimitiveChromaticAberrationProps } from '@dryui/primitives/chromatic-aberration';
interface Props extends HTMLAttributes<HTMLDivElement> {
	offset?: PrimitiveChromaticAberrationProps['offset'];
	angle?: PrimitiveChromaticAberrationProps['angle'];
	children: PrimitiveChromaticAberrationProps['children'];
}
declare const ChromaticAberration: import('svelte').Component<Props, {}, ''>;
type ChromaticAberration = ReturnType<typeof ChromaticAberration>;
export default ChromaticAberration;
