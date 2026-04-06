import type { Snippet } from 'svelte';
interface Props {
	open?: boolean;
	value?: string;
	disabled?: boolean;
	name?: string;
	class?: string;
	children: Snippet;
}
declare const SelectRoot: import('svelte').Component<Props, {}, 'value' | 'open'>;
type SelectRoot = ReturnType<typeof SelectRoot>;
export default SelectRoot;
