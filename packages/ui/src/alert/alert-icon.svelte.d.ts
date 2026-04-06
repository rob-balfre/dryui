import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}
declare const AlertIcon: import('svelte').Component<Props, {}, ''>;
type AlertIcon = ReturnType<typeof AlertIcon>;
export default AlertIcon;
