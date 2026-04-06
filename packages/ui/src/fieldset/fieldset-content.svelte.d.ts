import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FieldsetContent: import('svelte').Component<Props, {}, ''>;
type FieldsetContent = ReturnType<typeof FieldsetContent>;
export default FieldsetContent;
