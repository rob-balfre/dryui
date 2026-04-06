import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: Date | null;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	children: Snippet;
}
declare const CalendarRoot: import('svelte').Component<Props, {}, 'value'>;
type CalendarRoot = ReturnType<typeof CalendarRoot>;
export default CalendarRoot;
