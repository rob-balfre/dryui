import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const InputGroupAction: import('svelte').Component<Props, {}, ''>;
type InputGroupAction = ReturnType<typeof InputGroupAction>;
export default InputGroupAction;
