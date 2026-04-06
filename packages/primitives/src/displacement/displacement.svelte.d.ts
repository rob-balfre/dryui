import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	scale?: number;
	turbulence?: 'gentle' | 'medium' | 'rough';
	animated?: boolean;
	children?: Snippet;
}
declare const Displacement: import('svelte').Component<Props, {}, ''>;
type Displacement = ReturnType<typeof Displacement>;
export default Displacement;
