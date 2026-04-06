import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
declare const FloatButtonTrigger: import('svelte').Component<Props, {}, ''>;
type FloatButtonTrigger = ReturnType<typeof FloatButtonTrigger>;
export default FloatButtonTrigger;
