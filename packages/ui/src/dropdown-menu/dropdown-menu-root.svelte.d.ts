import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	children: Snippet;
}
declare const DropdownMenuRoot: import('svelte').Component<Props, {}, 'open'>;
type DropdownMenuRoot = ReturnType<typeof DropdownMenuRoot>;
export default DropdownMenuRoot;
