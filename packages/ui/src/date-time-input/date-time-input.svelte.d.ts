import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: Date;
	min?: Date;
	max?: Date;
	disabled?: boolean;
	locale?: string;
	name?: string;
	size?: 'sm' | 'md' | 'lg';
}
declare const DateTimeInput: import('svelte').Component<Props, {}, 'value'>;
type DateTimeInput = ReturnType<typeof DateTimeInput>;
export default DateTimeInput;
