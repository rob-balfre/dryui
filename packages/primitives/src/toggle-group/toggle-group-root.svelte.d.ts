import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	type?: 'single' | 'multiple';
	value?: string[];
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const ToggleGroupRoot: import('svelte').Component<Props, {}, 'value'>;
type ToggleGroupRoot = ReturnType<typeof ToggleGroupRoot>;
export default ToggleGroupRoot;
