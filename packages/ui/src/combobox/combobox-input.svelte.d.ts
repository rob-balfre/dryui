import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size'> {
	placeholder?: string;
	size?: 'sm' | 'md' | 'lg';
}
declare const ComboboxInput: import('svelte').Component<Props, {}, ''>;
type ComboboxInput = ReturnType<typeof ComboboxInput>;
export default ComboboxInput;
