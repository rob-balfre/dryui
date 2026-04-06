import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CardHeader: import('svelte').Component<Props, {}, ''>;
type CardHeader = ReturnType<typeof CardHeader>;
export default CardHeader;
