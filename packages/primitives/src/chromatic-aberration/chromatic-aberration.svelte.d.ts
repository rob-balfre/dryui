import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	offset?: number;
	angle?: number;
	children: Snippet;
}
declare const ChromaticAberration: import('svelte').Component<Props, {}, ''>;
type ChromaticAberration = ReturnType<typeof ChromaticAberration>;
export default ChromaticAberration;
