import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
	heading?: string;
}
declare const FooterLinkGroup: import('svelte').Component<Props, {}, ''>;
type FooterLinkGroup = ReturnType<typeof FooterLinkGroup>;
export default FooterLinkGroup;
