import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	background?: string;
	children: Snippet;
}
declare const Surface: import('svelte').Component<Props, {}, ''>;
type Surface = ReturnType<typeof Surface>;
export default Surface;
