import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLCanvasElement> {
	value: string;
	size?: number;
	errorCorrection?: 'L' | 'M' | 'Q' | 'H';
	fgColor?: string;
	bgColor?: string;
}
declare const QrCode: import('svelte').Component<Props, {}, ''>;
type QrCode = ReturnType<typeof QrCode>;
export default QrCode;
