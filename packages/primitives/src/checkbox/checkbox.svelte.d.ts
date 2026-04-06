import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	checked?: boolean;
	indeterminate?: boolean;
	disabled?: boolean;
}
declare const Checkbox: import('svelte').Component<Props, {}, 'checked'>;
type Checkbox = ReturnType<typeof Checkbox>;
export default Checkbox;
