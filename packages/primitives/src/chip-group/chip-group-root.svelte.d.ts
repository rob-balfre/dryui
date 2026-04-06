import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	type?: 'single' | 'multiple';
	value?: string[];
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const ChipGroupRoot: import('svelte').Component<Props, {}, 'value'>;
type ChipGroupRoot = ReturnType<typeof ChipGroupRoot>;
export default ChipGroupRoot;
