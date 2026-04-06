import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	direction?: 'up' | 'down' | 'flat';
	children: Snippet;
}
declare const StatCardTrend: import('svelte').Component<Props, {}, ''>;
type StatCardTrend = ReturnType<typeof StatCardTrend>;
export default StatCardTrend;
