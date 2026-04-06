import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLHeadingElement> {
	children: Snippet;
}
declare const AlertTitle: import('svelte').Component<Props, {}, ''>;
type AlertTitle = ReturnType<typeof AlertTitle>;
export default AlertTitle;
