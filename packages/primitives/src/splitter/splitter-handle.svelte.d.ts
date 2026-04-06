import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	index: number;
	children?: Snippet | undefined;
}
declare const SplitterHandle: import('svelte').Component<Props, {}, ''>;
type SplitterHandle = ReturnType<typeof SplitterHandle>;
export default SplitterHandle;
