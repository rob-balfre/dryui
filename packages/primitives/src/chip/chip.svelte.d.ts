import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
interface SharedProps {
	selected?: boolean;
	disabled?: boolean;
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	type?: 'button' | 'submit' | 'reset';
	onclick?: (event: MouseEvent) => void;
	children: Snippet;
}
type Props = SharedProps &
	Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'onclick' | 'children'> &
	Omit<
		HTMLAnchorAttributes,
		'href' | 'rel' | 'target' | 'download' | 'type' | 'onclick' | 'children'
	>;
declare const Chip: import('svelte').Component<Props, {}, ''>;
type Chip = ReturnType<typeof Chip>;
export default Chip;
