import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const SelectTrigger: import('svelte').Component<Props, {}, ''>;
type SelectTrigger = ReturnType<typeof SelectTrigger>;
export default SelectTrigger;
