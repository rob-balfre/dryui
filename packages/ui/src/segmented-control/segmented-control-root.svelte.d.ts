import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}
declare const SegmentedControlRoot: import('svelte').Component<Props, {}, 'value'>;
type SegmentedControlRoot = ReturnType<typeof SegmentedControlRoot>;
export default SegmentedControlRoot;
