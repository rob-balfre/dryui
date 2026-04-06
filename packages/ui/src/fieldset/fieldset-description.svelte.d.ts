import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const FieldsetDescription: import('svelte').Component<Props, {}, ''>;
type FieldsetDescription = ReturnType<typeof FieldsetDescription>;
export default FieldsetDescription;
