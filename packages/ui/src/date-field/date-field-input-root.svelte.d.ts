import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: Date | null;
	name?: string;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
declare const DateFieldRoot: import('svelte').Component<Props, {}, 'value'>;
type DateFieldRoot = ReturnType<typeof DateFieldRoot>;
export default DateFieldRoot;
