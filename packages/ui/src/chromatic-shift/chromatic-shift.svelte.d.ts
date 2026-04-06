import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type ChromaticShiftProps as PrimitiveChromaticShiftProps } from '@dryui/primitives/chromatic-shift';
interface Props extends HTMLAttributes<HTMLDivElement> {
	offset?: PrimitiveChromaticShiftProps['offset'];
	channels?: PrimitiveChromaticShiftProps['channels'];
	trigger?: PrimitiveChromaticShiftProps['trigger'];
	animated?: PrimitiveChromaticShiftProps['animated'];
	children: Snippet;
}
declare const ChromaticShift: import('svelte').Component<Props, {}, ''>;
type ChromaticShift = ReturnType<typeof ChromaticShift>;
export default ChromaticShift;
