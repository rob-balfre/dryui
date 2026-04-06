import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	label?: string;
	children: Snippet;
}
declare const Icon: import('svelte').Component<Props, {}, ''>;
type Icon = ReturnType<typeof Icon>;
export default Icon;
