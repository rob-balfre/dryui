import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	placeholder?: string;
}
declare const ComboboxInput: import('svelte').Component<Props, {}, ''>;
type ComboboxInput = ReturnType<typeof ComboboxInput>;
export default ComboboxInput;
