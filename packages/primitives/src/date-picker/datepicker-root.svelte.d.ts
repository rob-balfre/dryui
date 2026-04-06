import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	value?: Date | null;
	name?: string;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	children: Snippet;
}
declare const DatepickerRoot: import('svelte').Component<Props, {}, 'value' | 'open'>;
type DatepickerRoot = ReturnType<typeof DatepickerRoot>;
export default DatepickerRoot;
