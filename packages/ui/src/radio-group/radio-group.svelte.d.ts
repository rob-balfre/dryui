import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	name?: string;
	disabled?: boolean;
	required?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const RadioGroup: import('svelte').Component<Props, {}, 'value'>;
type RadioGroup = ReturnType<typeof RadioGroup>;
export default RadioGroup;
