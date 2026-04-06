import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	color?: string;
}
declare const ColorPickerSwatch: import('svelte').Component<Props, {}, ''>;
type ColorPickerSwatch = ReturnType<typeof ColorPickerSwatch>;
export default ColorPickerSwatch;
