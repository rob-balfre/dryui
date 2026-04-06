import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children?: Snippet;
	variant?: string;
	pulse?: boolean;
	icon?: Snippet;
}
declare const Badge: import('svelte').Component<Props, {}, ''>;
type Badge = ReturnType<typeof Badge>;
export default Badge;
