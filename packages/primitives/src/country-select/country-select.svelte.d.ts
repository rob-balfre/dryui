import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onchange'> {
	value?: string;
	regions?: string[];
	showDialCode?: boolean;
	disabled?: boolean;
	placeholder?: string;
	name?: string;
	onchange?: (code: string) => void;
	children?: Snippet;
}
declare const CountrySelect: import('svelte').Component<Props, {}, 'value'>;
type CountrySelect = ReturnType<typeof CountrySelect>;
export default CountrySelect;
