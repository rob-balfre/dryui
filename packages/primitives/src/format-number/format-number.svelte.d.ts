import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLSpanElement> {
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
declare const FormatNumber: import('svelte').Component<Props, {}, ''>;
type FormatNumber = ReturnType<typeof FormatNumber>;
export default FormatNumber;
