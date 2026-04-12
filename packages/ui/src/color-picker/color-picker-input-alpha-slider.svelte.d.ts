import type { HTMLInputAttributes } from 'svelte/elements';
type Props = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;
declare const ColorPickerAlphaSlider: import('svelte').Component<Props, {}, ''>;
type ColorPickerAlphaSlider = ReturnType<typeof ColorPickerAlphaSlider>;
export default ColorPickerAlphaSlider;
