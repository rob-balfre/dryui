import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	disabled?: boolean;
	children: Snippet;
}
declare const ToolbarButton: import('svelte').Component<Props, {}, ''>;
type ToolbarButton = ReturnType<typeof ToolbarButton>;
export default ToolbarButton;
