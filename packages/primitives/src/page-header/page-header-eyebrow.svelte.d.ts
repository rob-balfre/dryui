import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const PageHeaderEyebrow: import('svelte').Component<Props, {}, ''>;
type PageHeaderEyebrow = ReturnType<typeof PageHeaderEyebrow>;
export default PageHeaderEyebrow;
