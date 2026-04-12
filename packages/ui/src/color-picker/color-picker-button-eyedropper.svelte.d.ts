import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children?: Snippet;
}
declare const ColorPickerEyedropper: import('svelte').Component<Props, {}, ''>;
type ColorPickerEyedropper = ReturnType<typeof ColorPickerEyedropper>;
export default ColorPickerEyedropper;
