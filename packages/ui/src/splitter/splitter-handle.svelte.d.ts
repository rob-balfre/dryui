import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	index: number;
	children?: Snippet;
}
declare const SplitterHandle: import('svelte').Component<Props, {}, ''>;
type SplitterHandle = ReturnType<typeof SplitterHandle>;
export default SplitterHandle;
