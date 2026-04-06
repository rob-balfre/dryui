import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DescriptionListItem: import('svelte').Component<Props, {}, ''>;
type DescriptionListItem = ReturnType<typeof DescriptionListItem>;
export default DescriptionListItem;
