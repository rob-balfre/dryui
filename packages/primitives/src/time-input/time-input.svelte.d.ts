import type { HTMLInputAttributes } from 'svelte/elements';
interface Props extends HTMLInputAttributes {
	value?: string;
	disabled?: boolean;
	step?: number;
}
declare const TimeInput: import('svelte').Component<Props, {}, 'value'>;
type TimeInput = ReturnType<typeof TimeInput>;
export default TimeInput;
