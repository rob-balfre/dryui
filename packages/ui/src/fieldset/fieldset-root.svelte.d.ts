import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLFieldSetElement> {
	children: Snippet;
}
declare const FieldsetRoot: import('svelte').Component<Props, {}, ''>;
type FieldsetRoot = ReturnType<typeof FieldsetRoot>;
export default FieldsetRoot;
