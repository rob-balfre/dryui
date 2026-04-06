import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string | string[];
	multiple?: boolean;
	disabled?: boolean;
	onvaluechange?: (value: string | string[]) => void;
	children: Snippet;
}
declare const ListboxRoot: import('svelte').Component<Props, {}, 'value'>;
type ListboxRoot = ReturnType<typeof ListboxRoot>;
export default ListboxRoot;
