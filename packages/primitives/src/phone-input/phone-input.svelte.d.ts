import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface CountryInfo {
	code: string;
	name: string;
	dialCode: string;
	flag: string;
	format?: string;
}
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: string;
	defaultCountry?: string;
	disabled?: boolean;
	name?: string;
	placeholder?: string;
	countries?: CountryInfo[];
	onchange?: (value: string) => void;
	children?: Snippet;
}
declare const PhoneInput: import('svelte').Component<Props, {}, 'value'>;
type PhoneInput = ReturnType<typeof PhoneInput>;
export default PhoneInput;
