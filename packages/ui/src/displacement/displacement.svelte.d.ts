import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type DisplacementProps as PrimitiveDisplacementProps } from '@dryui/primitives/displacement';
interface Props extends HTMLAttributes<HTMLDivElement> {
	scale?: PrimitiveDisplacementProps['scale'];
	turbulence?: PrimitiveDisplacementProps['turbulence'];
	animated?: PrimitiveDisplacementProps['animated'];
	children: Snippet;
}
declare const Displacement: import('svelte').Component<Props, {}, ''>;
type Displacement = ReturnType<typeof Displacement>;
export default Displacement;
