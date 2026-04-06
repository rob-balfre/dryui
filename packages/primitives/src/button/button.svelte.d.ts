import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	disabled?: boolean;
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	type?: 'button' | 'submit' | 'reset';
	children: Snippet;
}
declare const Button: import('svelte').Component<Props, {}, ''>;
type Button = ReturnType<typeof Button>;
export default Button;
