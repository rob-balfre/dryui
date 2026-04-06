import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TimelineItem: import('svelte').Component<Props, {}, ''>;
type TimelineItem = ReturnType<typeof TimelineItem>;
export default TimelineItem;
