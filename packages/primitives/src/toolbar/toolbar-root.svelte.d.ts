import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const ToolbarRoot: import('svelte').Component<Props, {}, ''>;
type ToolbarRoot = ReturnType<typeof ToolbarRoot>;
export default ToolbarRoot;
