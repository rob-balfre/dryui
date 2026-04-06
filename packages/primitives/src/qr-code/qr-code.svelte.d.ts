import type { HTMLAttributes } from 'svelte/elements';
import { type ErrorCorrectionLevel } from './qr-encode.js';
interface Props extends HTMLAttributes<HTMLCanvasElement> {
	value: string;
	size?: number;
	errorCorrection?: ErrorCorrectionLevel;
	fgColor?: string;
	bgColor?: string;
}
declare const QrCode: import('svelte').Component<Props, {}, ''>;
type QrCode = ReturnType<typeof QrCode>;
export default QrCode;
