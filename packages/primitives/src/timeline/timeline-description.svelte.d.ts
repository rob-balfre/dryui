import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const TimelineDescription: import('svelte').Component<Props, {}, ''>;
type TimelineDescription = ReturnType<typeof TimelineDescription>;
export default TimelineDescription;
