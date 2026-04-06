import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DropdownMenuGroup: import('svelte').Component<Props, {}, ''>;
type DropdownMenuGroup = ReturnType<typeof DropdownMenuGroup>;
export default DropdownMenuGroup;
