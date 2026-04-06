import { createContext } from '../utils/create-context.js';
import type { RGB, HSV, HSL } from './color-utils.js';

export interface ColorPickerContext {
	readonly hex: string;
	readonly rgb: RGB;
	readonly hsv: HSV;
	readonly hsl: HSL;
	readonly alpha: number; // 0-1
	readonly disabled: boolean;
	setFromHsv: (hsv: HSV) => void;
	setFromHex: (hex: string) => void;
	setFromRgb: (rgb: RGB) => void;
	setHue: (h: number) => void;
	setSaturationValue: (s: number, v: number) => void;
	setAlpha: (a: number) => void;
}
export const [setColorPickerCtx, getColorPickerCtx] =
	createContext<ColorPickerContext>('color-picker');
