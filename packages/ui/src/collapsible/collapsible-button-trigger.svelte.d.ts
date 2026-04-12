import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const CollapsibleTrigger: import('svelte').Component<Props, {}, ''>;
type CollapsibleTrigger = ReturnType<typeof CollapsibleTrigger>;
export default CollapsibleTrigger;
