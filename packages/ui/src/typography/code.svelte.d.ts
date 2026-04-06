import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const Code: import('svelte').Component<Props, {}, ''>;
type Code = ReturnType<typeof Code>;
export default Code;
