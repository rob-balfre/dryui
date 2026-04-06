import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FooterBrand: import('svelte').Component<Props, {}, ''>;
type FooterBrand = ReturnType<typeof FooterBrand>;
export default FooterBrand;
