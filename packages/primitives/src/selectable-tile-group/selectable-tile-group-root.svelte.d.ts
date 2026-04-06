import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const SelectableTileGroupRoot: import('svelte').Component<Props, {}, 'value'>;
type SelectableTileGroupRoot = ReturnType<typeof SelectableTileGroupRoot>;
export default SelectableTileGroupRoot;
