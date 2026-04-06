import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	pressed?: boolean;
	disabled?: boolean;
	children?: Snippet;
}
declare const Toggle: import('svelte').Component<Props, {}, 'pressed'>;
type Toggle = ReturnType<typeof Toggle>;
export default Toggle;
