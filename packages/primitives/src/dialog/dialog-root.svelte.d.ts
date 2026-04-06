import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	children: Snippet;
}
declare const DialogRoot: import('svelte').Component<Props, {}, 'open'>;
type DialogRoot = ReturnType<typeof DialogRoot>;
export default DialogRoot;
