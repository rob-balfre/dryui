import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	index: number;
	children: Snippet;
}
declare const SplitterPanel: import('svelte').Component<Props, {}, ''>;
type SplitterPanel = ReturnType<typeof SplitterPanel>;
export default SplitterPanel;
