export interface RGB {
	r: number;
	g: number;
	b: number;
}
export interface HSV {
	h: number;
	s: number;
	v: number;
}
export interface HSL {
	h: number;
	s: number;
	l: number;
}
export declare function clamp(value: number, min: number, max: number): number;
export declare function isValidHex(hex: string): boolean;
export declare function hexToRgb(hex: string): RGB;
export declare function rgbToHex(rgb: RGB): string;
export declare function rgbToHsv(rgb: RGB): HSV;
export declare function hsvToRgb(hsv: HSV): RGB;
export declare function rgbToHsl(rgb: RGB): HSL;
export declare function hslToRgb(hsl: HSL): RGB;
export declare function hsvToHsl(hsv: HSV): HSL;
export declare function hslToHsv(hsl: HSL): HSV;
export declare function formatRgb(rgb: RGB): string;
export declare function formatHsl(hsl: HSL): string;
export declare function parseColor(color: string): RGB | null;
