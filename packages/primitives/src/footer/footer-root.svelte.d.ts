import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const FooterRoot: import('svelte').Component<Props, {}, ''>;
type FooterRoot = ReturnType<typeof FooterRoot>;
export default FooterRoot;
