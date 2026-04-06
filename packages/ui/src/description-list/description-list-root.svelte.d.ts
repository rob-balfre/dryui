import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDListElement> {
	children: Snippet;
}
declare const DescriptionListRoot: import('svelte').Component<Props, {}, ''>;
type DescriptionListRoot = ReturnType<typeof DescriptionListRoot>;
export default DescriptionListRoot;
