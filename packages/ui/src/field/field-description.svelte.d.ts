import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const FieldDescription: import('svelte').Component<Props, {}, ''>;
type FieldDescription = ReturnType<typeof FieldDescription>;
export default FieldDescription;
