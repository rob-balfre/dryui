import type { HTMLInputAttributes } from 'svelte/elements';
type Props = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;
declare const ColorPickerHueSlider: import('svelte').Component<Props, {}, ''>;
type ColorPickerHueSlider = ReturnType<typeof ColorPickerHueSlider>;
export default ColorPickerHueSlider;
