import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const EmptyStateAction: import('svelte').Component<Props, {}, ''>;
type EmptyStateAction = ReturnType<typeof EmptyStateAction>;
export default EmptyStateAction;
