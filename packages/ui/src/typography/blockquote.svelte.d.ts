import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLQuoteElement> {
	children: Snippet;
}
declare const Blockquote: import('svelte').Component<Props, {}, ''>;
type Blockquote = ReturnType<typeof Blockquote>;
export default Blockquote;
