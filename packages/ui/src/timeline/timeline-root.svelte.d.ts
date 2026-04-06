import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'vertical' | 'horizontal';
	children: Snippet;
}
declare const TimelineRoot: import('svelte').Component<Props, {}, ''>;
type TimelineRoot = ReturnType<typeof TimelineRoot>;
export default TimelineRoot;
