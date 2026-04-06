import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes } from 'svelte/elements';
interface Props extends HTMLAnchorAttributes {
	children: Snippet;
}
declare const LinkPreviewTrigger: import('svelte').Component<Props, {}, ''>;
type LinkPreviewTrigger = ReturnType<typeof LinkPreviewTrigger>;
export default LinkPreviewTrigger;
