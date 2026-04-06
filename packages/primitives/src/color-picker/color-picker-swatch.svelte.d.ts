import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	/** When provided, displays this hex color instead of the current picker color. Clicking selects it. */
	color?: string | undefined;
}
declare const ColorPickerSwatch: import('svelte').Component<Props, {}, ''>;
type ColorPickerSwatch = ReturnType<typeof ColorPickerSwatch>;
export default ColorPickerSwatch;
