import type { HTMLAttributes } from 'svelte/elements';
import type { CountryInfo } from '../internal/countries.js';

export type { CountryInfo };

export interface PhoneInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: string;
	defaultCountry?: string;
	disabled?: boolean;
	name?: string;
	placeholder?: string;
	countries?: CountryInfo[];
	onchange?: (value: string) => void;
}

export { default as PhoneInput } from './phone-input.svelte';
