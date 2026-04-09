import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface CountrySelectProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: string;
	regions?: string[];
	showDialCode?: boolean;
	disabled?: boolean;
	placeholder?: string;
	name?: string;
	onchange?: (code: string) => void;
	children?: Snippet;
}
export { default as CountrySelect } from './country-select.svelte';
