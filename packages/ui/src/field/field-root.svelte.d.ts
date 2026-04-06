import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	error?: string;
	required?: boolean;
	disabled?: boolean;
}
declare const FieldRoot: import('svelte').Component<Props, {}, ''>;
type FieldRoot = ReturnType<typeof FieldRoot>;
export default FieldRoot;
