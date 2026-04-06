import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	value: number;
	locale?: string;
	unit?: 'byte' | 'bit';
	display?: 'short' | 'long' | 'narrow';
}
declare const FormatBytes: import('svelte').Component<Props, {}, ''>;
type FormatBytes = ReturnType<typeof FormatBytes>;
export default FormatBytes;
