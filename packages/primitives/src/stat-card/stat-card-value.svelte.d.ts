import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const StatCardValue: import('svelte').Component<Props, {}, ''>;
type StatCardValue = ReturnType<typeof StatCardValue>;
export default StatCardValue;
