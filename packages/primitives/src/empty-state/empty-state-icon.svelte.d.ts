import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const EmptyStateIcon: import('svelte').Component<Props, {}, ''>;
type EmptyStateIcon = ReturnType<typeof EmptyStateIcon>;
export default EmptyStateIcon;
