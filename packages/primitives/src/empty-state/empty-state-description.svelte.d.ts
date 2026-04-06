import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const EmptyStateDescription: import('svelte').Component<Props, {}, ''>;
type EmptyStateDescription = ReturnType<typeof EmptyStateDescription>;
export default EmptyStateDescription;
