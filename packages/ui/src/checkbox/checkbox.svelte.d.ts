import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLInputAttributes, 'size'> {
	checked?: boolean;
	indeterminate?: boolean;
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
}
declare const Checkbox: import('svelte').Component<Props, {}, 'checked'>;
type Checkbox = ReturnType<typeof Checkbox>;
export default Checkbox;
