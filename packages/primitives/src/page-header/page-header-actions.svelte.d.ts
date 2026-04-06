import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const PageHeaderActions: import('svelte').Component<Props, {}, ''>;
type PageHeaderActions = ReturnType<typeof PageHeaderActions>;
export default PageHeaderActions;
