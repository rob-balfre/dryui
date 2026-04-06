import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const ComboboxEmpty: import('svelte').Component<Props, {}, ''>;
type ComboboxEmpty = ReturnType<typeof ComboboxEmpty>;
export default ComboboxEmpty;
