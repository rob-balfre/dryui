import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
	density?: 'comfortable' | 'compact';
	children: Snippet;
}
declare const StatCardRoot: import('svelte').Component<Props, {}, ''>;
type StatCardRoot = ReturnType<typeof StatCardRoot>;
export default StatCardRoot;
