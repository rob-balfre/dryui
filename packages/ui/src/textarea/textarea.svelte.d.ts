import type { HTMLTextareaAttributes } from 'svelte/elements';
interface Props extends HTMLTextareaAttributes {
	value?: string;
	size?: 'sm' | 'md' | 'lg';
	disabled?: boolean;
}
declare const Textarea: import('svelte').Component<Props, {}, 'value'>;
type Textarea = ReturnType<typeof Textarea>;
export default Textarea;
