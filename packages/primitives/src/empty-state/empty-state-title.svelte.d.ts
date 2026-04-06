import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLHeadingElement> {
	children: Snippet;
}
declare const EmptyStateTitle: import('svelte').Component<Props, {}, ''>;
type EmptyStateTitle = ReturnType<typeof EmptyStateTitle>;
export default EmptyStateTitle;
