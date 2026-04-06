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
	loading?: boolean;
	loadingContent?: Snippet;
	children: Snippet;
}
declare const ComboboxContent: import('svelte').Component<Props, {}, ''>;
type ComboboxContent = ReturnType<typeof ComboboxContent>;
export default ComboboxContent;
