import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes, HTMLButtonAttributes } from 'svelte/elements';
export type { RGB, HSV, HSL } from './color-utils.js';
export { hexToRgb, rgbToHex, rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb, hsvToHsl, hslToHsv, isValidHex, clamp, formatRgb, formatHsl, parseColor } from './color-utils.js';
export interface ColorPickerRootProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    alpha?: number;
    disabled?: boolean;
    children: Snippet;
}
export interface ColorPickerAreaProps extends HTMLAttributes<HTMLDivElement> {
    width?: number;
    height?: number;
}
export type ColorPickerHueSliderProps = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;
export type ColorPickerAlphaSliderProps = Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max' | 'step'>;
export interface ColorPickerInputProps extends Omit<HTMLInputAttributes, 'value' | 'type'> {
    format?: 'hex' | 'rgb' | 'hsl';
}
export interface ColorPickerSwatchProps extends HTMLAttributes<HTMLDivElement> {
    color?: string | undefined;
}
export interface ColorPickerEyeDropperProps extends Omit<HTMLButtonAttributes, 'children'> {
    children?: Snippet | undefined;
}
export interface ColorPickerChannelInputProps extends Omit<HTMLInputAttributes, 'value' | 'type' | 'min' | 'max'> {
    channel: 'h' | 's' | 'v';
}
import ColorPickerRoot from './color-picker-root.svelte';
import ColorPickerArea from './color-picker-area.svelte';
import ColorPickerHueSlider from './color-picker-hue-slider.svelte';
import ColorPickerAlphaSlider from './color-picker-alpha-slider.svelte';
import ColorPickerInput from './color-picker-input.svelte';
import ColorPickerSwatch from './color-picker-swatch.svelte';
import ColorPickerEyeDropper from './color-picker-eyedropper.svelte';
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
