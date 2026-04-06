import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CardContent: import('svelte').Component<Props, {}, ''>;
type CardContent = ReturnType<typeof CardContent>;
export default CardContent;
