import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	alpha?: number;
	disabled?: boolean;
	width?: number;
	areaHeight?: number;
	children: Snippet;
}
declare const ColorPickerRoot: import('svelte').Component<Props, {}, 'value' | 'alpha'>;
type ColorPickerRoot = ReturnType<typeof ColorPickerRoot>;
export default ColorPickerRoot;
