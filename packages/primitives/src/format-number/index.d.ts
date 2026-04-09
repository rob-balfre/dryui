import type { HTMLAttributes } from 'svelte/elements';
export interface FormatNumberProps extends HTMLAttributes<HTMLSpanElement> {
	value: number;
	locale?: string;
	type?: 'decimal' | 'currency' | 'percent' | 'unit';
	currency?: string;
	unit?: string;
	notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	minimumIntegerDigits?: number;
	minimumSignificantDigits?: number;
	maximumSignificantDigits?: number;
}
export { default as FormatNumber } from './format-number.svelte';
