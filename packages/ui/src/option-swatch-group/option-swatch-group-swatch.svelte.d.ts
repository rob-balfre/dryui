import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	color?: string;
	shape?: 'circle' | 'rounded';
	children?: Snippet;
}
declare const OptionSwatchGroupSwatch: import('svelte').Component<Props, {}, ''>;
type OptionSwatchGroupSwatch = ReturnType<typeof OptionSwatchGroupSwatch>;
export default OptionSwatchGroupSwatch;
