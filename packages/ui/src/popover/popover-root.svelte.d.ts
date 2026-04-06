import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	children: Snippet;
}
declare const PopoverRoot: import('svelte').Component<Props, {}, 'open'>;
type PopoverRoot = ReturnType<typeof PopoverRoot>;
export default PopoverRoot;
