import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const StatCardLabel: import('svelte').Component<Props, {}, ''>;
type StatCardLabel = ReturnType<typeof StatCardLabel>;
export default StatCardLabel;
