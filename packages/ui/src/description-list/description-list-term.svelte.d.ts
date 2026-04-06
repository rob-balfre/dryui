import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const DescriptionListTerm: import('svelte').Component<Props, {}, ''>;
type DescriptionListTerm = ReturnType<typeof DescriptionListTerm>;
export default DescriptionListTerm;
