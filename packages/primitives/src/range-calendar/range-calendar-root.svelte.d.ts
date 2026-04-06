import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	startDate?: Date | null;
	endDate?: Date | null;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	children: Snippet;
}
declare const RangeCalendarRoot: import('svelte').Component<Props, {}, 'startDate' | 'endDate'>;
type RangeCalendarRoot = ReturnType<typeof RangeCalendarRoot>;
export default RangeCalendarRoot;
