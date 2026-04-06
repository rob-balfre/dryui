import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const ButtonGroup: import('svelte').Component<Props, {}, ''>;
type ButtonGroup = ReturnType<typeof ButtonGroup>;
export default ButtonGroup;
