export type { ColorPickerAreaProps, ColorPickerHueSliderProps, ColorPickerAlphaSliderProps, ColorPickerInputProps, ColorPickerSwatchProps, ColorPickerEyeDropperProps, ColorPickerChannelInputProps } from '@dryui/primitives';
import type { ColorPickerRootProps as PrimitiveColorPickerRootProps } from '@dryui/primitives';
export interface ColorPickerRootProps extends PrimitiveColorPickerRootProps {
    width?: number;
    areaHeight?: number;
}
import ColorPickerRoot from './color-picker-root.svelte';
import ColorPickerArea from './color-picker-area.svelte';
import ColorPickerHueSlider from './color-picker-input-hue-slider.svelte';
import ColorPickerAlphaSlider from './color-picker-input-alpha-slider.svelte';
import ColorPickerInput from './color-picker-input.svelte';
import ColorPickerSwatch from './color-picker-swatch.svelte';
import ColorPickerEyeDropper from './color-picker-button-eyedropper.svelte';
import ColorPickerChannelInput from './color-picker-channel-input.svelte';
export declare const ColorPicker: {
    Root: typeof ColorPickerRoot;
    Area: typeof ColorPickerArea;
    HueSlider: typeof ColorPickerHueSlider;
    AlphaSlider: typeof ColorPickerAlphaSlider;
    Input: typeof ColorPickerInput;
    Swatch: typeof ColorPickerSwatch;
    EyeDropper: typeof ColorPickerEyeDropper;
    ChannelInput: typeof ColorPickerChannelInput;
};
