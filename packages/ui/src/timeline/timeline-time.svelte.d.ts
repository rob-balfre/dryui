import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLTimeElement> {
	datetime?: string;
	children: Snippet;
}
declare const TimelineTime: import('svelte').Component<Props, {}, ''>;
type TimelineTime = ReturnType<typeof TimelineTime>;
export default TimelineTime;
