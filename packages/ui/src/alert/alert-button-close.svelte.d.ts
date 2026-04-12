import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const AlertClose: import('svelte').Component<Props, {}, ''>;
type AlertClose = ReturnType<typeof AlertClose>;
export default AlertClose;
