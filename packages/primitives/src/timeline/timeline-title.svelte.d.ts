import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLHeadingElement> {
	level?: 1 | 2 | 3 | 4 | 5 | 6;
	children: Snippet;
}
declare const TimelineTitle: import('svelte').Component<Props, {}, ''>;
type TimelineTitle = ReturnType<typeof TimelineTitle>;
export default TimelineTitle;
