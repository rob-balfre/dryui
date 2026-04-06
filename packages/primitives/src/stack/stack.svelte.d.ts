import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const Stack: import('svelte').Component<Props, {}, ''>;
type Stack = ReturnType<typeof Stack>;
export default Stack;
