import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	disabled?: boolean;
	children: Snippet;
}
declare const CollapsibleRoot: import('svelte').Component<Props, {}, 'open'>;
type CollapsibleRoot = ReturnType<typeof CollapsibleRoot>;
export default CollapsibleRoot;
