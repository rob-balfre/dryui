import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	separator?: string;
}
declare const DateFieldSeparator: import('svelte').Component<Props, {}, ''>;
type DateFieldSeparator = ReturnType<typeof DateFieldSeparator>;
export default DateFieldSeparator;
