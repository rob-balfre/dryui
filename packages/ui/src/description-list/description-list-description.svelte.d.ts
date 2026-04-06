import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const DescriptionListDescription: import('svelte').Component<Props, {}, ''>;
type DescriptionListDescription = ReturnType<typeof DescriptionListDescription>;
export default DescriptionListDescription;
