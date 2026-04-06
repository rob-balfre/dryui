import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	sizes?: number[];
	children: Snippet;
}
declare const SplitterRoot: import('svelte').Component<Props, {}, 'sizes'>;
type SplitterRoot = ReturnType<typeof SplitterRoot>;
export default SplitterRoot;
