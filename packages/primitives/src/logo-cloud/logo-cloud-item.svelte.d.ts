import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLElement> {
	href?: string;
	name?: string;
	children: Snippet;
}
declare const LogoCloudItem: import('svelte').Component<Props, {}, ''>;
type LogoCloudItem = ReturnType<typeof LogoCloudItem>;
export default LogoCloudItem;
