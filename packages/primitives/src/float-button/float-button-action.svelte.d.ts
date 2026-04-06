import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const FloatButtonAction: import('svelte').Component<Props, {}, ''>;
type FloatButtonAction = ReturnType<typeof FloatButtonAction>;
export default FloatButtonAction;
