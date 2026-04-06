import type { Snippet } from 'svelte';
import type { HTMLLabelAttributes } from 'svelte/elements';
interface Props extends HTMLLabelAttributes {
	children: Snippet;
}
declare const Label: import('svelte').Component<Props, {}, ''>;
type Label = ReturnType<typeof Label>;
export default Label;
