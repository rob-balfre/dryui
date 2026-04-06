import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	offset?: number;
	channels?: 'rgb' | 'rb';
	trigger?: 'hover' | 'always' | 'none';
	animated?: boolean;
	children?: Snippet;
}
declare const ChromaticShift: import('svelte').Component<Props, {}, ''>;
type ChromaticShift = ReturnType<typeof ChromaticShift>;
export default ChromaticShift;
