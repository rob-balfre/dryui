import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const TimelineContent: import('svelte').Component<Props, {}, ''>;
type TimelineContent = ReturnType<typeof TimelineContent>;
export default TimelineContent;
