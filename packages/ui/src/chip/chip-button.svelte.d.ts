import type { Snippet } from 'svelte';
import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ChipColor } from './index.js';
interface SharedProps {
	selected?: boolean;
	disabled?: boolean;
	variant?: 'solid' | 'outline' | 'soft';
	color?: ChipColor;
	size?: 'sm' | 'md';
	href?: string;
	rel?: string;
	target?: string;
	download?: boolean | string;
	type?: 'button' | 'submit' | 'reset';
	onclick?: (event: MouseEvent) => void;
	children: Snippet;
}
type RestProps = Omit<HTMLButtonAttributes, 'type' | 'disabled' | 'onclick' | 'children'> &
	Omit<
		HTMLAnchorAttributes,
		'href' | 'rel' | 'target' | 'download' | 'type' | 'onclick' | 'children'
	>;
type Props = SharedProps & RestProps;
declare const Chip: import('svelte').Component<Props, {}, ''>;
type Chip = ReturnType<typeof Chip>;
export default Chip;
