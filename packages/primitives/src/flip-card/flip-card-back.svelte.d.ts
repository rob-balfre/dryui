import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FlipCardBack: import('svelte').Component<Props, {}, ''>;
type FlipCardBack = ReturnType<typeof FlipCardBack>;
export default FlipCardBack;
