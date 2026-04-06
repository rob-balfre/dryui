import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}
declare const VisuallyHidden: import('svelte').Component<Props, {}, ''>;
type VisuallyHidden = ReturnType<typeof VisuallyHidden>;
export default VisuallyHidden;
