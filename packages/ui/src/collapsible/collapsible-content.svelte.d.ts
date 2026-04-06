import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const CollapsibleContent: import('svelte').Component<Props, {}, ''>;
type CollapsibleContent = ReturnType<typeof CollapsibleContent>;
export default CollapsibleContent;
