import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	children: Snippet;
}
declare const FooterLinks: import('svelte').Component<Props, {}, ''>;
type FooterLinks = ReturnType<typeof FooterLinks>;
export default FooterLinks;
