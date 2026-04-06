import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	width?: number;
	height?: number;
}
declare const ColorPickerArea: import('svelte').Component<Props, {}, ''>;
type ColorPickerArea = ReturnType<typeof ColorPickerArea>;
export default ColorPickerArea;
