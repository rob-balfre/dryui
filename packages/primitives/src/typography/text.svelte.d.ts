import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	as?: 'p' | 'span' | 'div';
	children: Snippet;
}
declare const Text: import('svelte').Component<Props, {}, ''>;
type Text = ReturnType<typeof Text>;
export default Text;
