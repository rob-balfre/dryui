import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	disabled?: boolean;
	children: Snippet;
}
declare const DropdownMenuItem: import('svelte').Component<Props, {}, ''>;
type DropdownMenuItem = ReturnType<typeof DropdownMenuItem>;
export default DropdownMenuItem;
