import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CardFooter: import('svelte').Component<Props, {}, ''>;
type CardFooter = ReturnType<typeof CardFooter>;
export default CardFooter;
