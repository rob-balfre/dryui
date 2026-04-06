import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	placeholder?: string;
}
declare const SelectValue: import('svelte').Component<Props, {}, ''>;
type SelectValue = ReturnType<typeof SelectValue>;
export default SelectValue;
