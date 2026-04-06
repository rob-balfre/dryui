import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	placement?:
		| 'top'
		| 'top-start'
		| 'top-end'
		| 'bottom'
		| 'bottom-start'
		| 'bottom-end'
		| 'left'
		| 'left-start'
		| 'left-end'
		| 'right'
		| 'right-start'
		| 'right-end';
	offset?: number;
	children: Snippet;
}
declare const SelectContent: import('svelte').Component<Props, {}, ''>;
type SelectContent = ReturnType<typeof SelectContent>;
export default SelectContent;
