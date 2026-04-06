import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	children: Snippet;
}
declare const ContextMenuRoot: import('svelte').Component<Props, {}, 'open'>;
type ContextMenuRoot = ReturnType<typeof ContextMenuRoot>;
export default ContextMenuRoot;
