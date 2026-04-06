import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FlipCardFront: import('svelte').Component<Props, {}, ''>;
type FlipCardFront = ReturnType<typeof FlipCardFront>;
export default FlipCardFront;
