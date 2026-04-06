import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}
declare const InputGroupPrefix: import('svelte').Component<Props, {}, ''>;
type InputGroupPrefix = ReturnType<typeof InputGroupPrefix>;
export default InputGroupPrefix;
