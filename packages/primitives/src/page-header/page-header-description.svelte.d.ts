import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLParagraphElement> {
	children: Snippet;
}
declare const PageHeaderDescription: import('svelte').Component<Props, {}, ''>;
type PageHeaderDescription = ReturnType<typeof PageHeaderDescription>;
export default PageHeaderDescription;
