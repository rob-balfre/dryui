import type { HTMLAttributes } from 'svelte/elements';
import type { CountryInfo } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	defaultCountry?: string;
	disabled?: boolean;
	name?: string;
	placeholder?: string;
	size?: 'sm' | 'md' | 'lg';
	countries?: CountryInfo[];
	onchange?: (value: string) => void;
}
declare const PhoneInput: import('svelte').Component<Props, {}, 'value'>;
type PhoneInput = ReturnType<typeof PhoneInput>;
export default PhoneInput;
