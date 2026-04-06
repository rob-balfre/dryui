import { createContext } from '@dryui/primitives';
import type { RGB, HSV, HSL } from '@dryui/primitives';

export interface ColorPickerContext {
	readonly hex: string;
	readonly rgb: RGB;
	readonly hsv: HSV;
	readonly hsl: HSL;
	readonly alpha: number;
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
