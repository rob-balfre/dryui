import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
	invalid?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const InputGroupRoot: import('svelte').Component<Props, {}, ''>;
type InputGroupRoot = ReturnType<typeof InputGroupRoot>;
export default InputGroupRoot;
