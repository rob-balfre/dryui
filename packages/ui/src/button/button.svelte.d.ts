import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'color'> {
	variant?:
		| 'solid'
		| 'outline'
		| 'ghost'
		| 'soft'
		| 'secondary'
		| 'link'
		| 'bare'
		| 'trigger'
		| 'nav'
		| 'tab'
		| 'toggle'
		| 'pill';
	size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';
	color?: 'primary' | 'danger' | (string & {}) | null;
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	ref?: (el: HTMLButtonElement | HTMLAnchorElement | null) => void;
	children: Snippet;
}
declare const Button: import('svelte').Component<Props, {}, ''>;
type Button = ReturnType<typeof Button>;
export default Button;
