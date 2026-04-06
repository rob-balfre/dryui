import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const TimelineIcon: import('svelte').Component<Props, {}, ''>;
type TimelineIcon = ReturnType<typeof TimelineIcon>;
export default TimelineIcon;
