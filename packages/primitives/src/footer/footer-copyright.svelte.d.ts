import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FooterCopyright: import('svelte').Component<Props, {}, ''>;
type FooterCopyright = ReturnType<typeof FooterCopyright>;
export default FooterCopyright;
