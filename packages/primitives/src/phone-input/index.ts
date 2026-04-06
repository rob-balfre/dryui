import type { HTMLAttributes } from 'svelte/elements';

export interface CountryInfo {
	code: string;
	name: string;
	dialCode: string;
	flag: string;
	format?: string;
}

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
