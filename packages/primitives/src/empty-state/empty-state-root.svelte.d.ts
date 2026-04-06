import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const EmptyStateRoot: import('svelte').Component<Props, {}, ''>;
type EmptyStateRoot = ReturnType<typeof EmptyStateRoot>;
export default EmptyStateRoot;
