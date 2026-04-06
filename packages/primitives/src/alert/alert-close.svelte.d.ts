import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	children?: Snippet | undefined;
}
declare const AlertClose: import('svelte').Component<Props, {}, ''>;
type AlertClose = ReturnType<typeof AlertClose>;
export default AlertClose;
