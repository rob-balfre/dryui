import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	openDelay?: number;
	closeDelay?: number;
	children: Snippet;
}
declare const LinkPreviewRoot: import('svelte').Component<Props, {}, ''>;
type LinkPreviewRoot = ReturnType<typeof LinkPreviewRoot>;
export default LinkPreviewRoot;
