import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const PageHeaderContent: import('svelte').Component<Props, {}, ''>;
type PageHeaderContent = ReturnType<typeof PageHeaderContent>;
export default PageHeaderContent;
