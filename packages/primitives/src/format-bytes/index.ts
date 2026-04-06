import type { HTMLAttributes } from 'svelte/elements';

export interface FormatBytesProps extends HTMLAttributes<HTMLSpanElement> {
	value: number;
	locale?: string;
	unit?: 'byte' | 'bit';
	display?: 'short' | 'long' | 'narrow';
}

export { default as FormatBytes } from './format-bytes.svelte';
