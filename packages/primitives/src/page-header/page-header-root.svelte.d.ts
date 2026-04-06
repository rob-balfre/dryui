import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const PageHeaderRoot: import('svelte').Component<Props, {}, ''>;
type PageHeaderRoot = ReturnType<typeof PageHeaderRoot>;
export default PageHeaderRoot;
