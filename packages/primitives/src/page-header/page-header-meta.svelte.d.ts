import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const PageHeaderMeta: import('svelte').Component<Props, {}, ''>;
type PageHeaderMeta = ReturnType<typeof PageHeaderMeta>;
export default PageHeaderMeta;
