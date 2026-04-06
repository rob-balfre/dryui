import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const DropdownMenuLabel: import('svelte').Component<Props, {}, ''>;
type DropdownMenuLabel = ReturnType<typeof DropdownMenuLabel>;
export default DropdownMenuLabel;
