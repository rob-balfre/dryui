import type { HTMLAttributes } from 'svelte/elements';
export interface QRCodeProps extends HTMLAttributes<HTMLCanvasElement> {
	value: string;
	size?: number;
	errorCorrection?: 'L' | 'M' | 'Q' | 'H';
	fgColor?: string;
	bgColor?: string;
}
export { default as QRCode } from './qr-code.svelte';
export { encodeQR } from './qr-encode.js';
export type { ErrorCorrectionLevel } from './qr-encode.js';
