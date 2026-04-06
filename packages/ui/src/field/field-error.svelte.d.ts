import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const FieldError: import('svelte').Component<Props, {}, ''>;
type FieldError = ReturnType<typeof FieldError>;
export default FieldError;
