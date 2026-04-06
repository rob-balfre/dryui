import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const InputGroupSuffix: import('svelte').Component<Props, {}, ''>;
type InputGroupSuffix = ReturnType<typeof InputGroupSuffix>;
export default InputGroupSuffix;
