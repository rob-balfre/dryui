import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children?: Snippet;
}
declare const OptionSwatchGroupLabel: import('svelte').Component<Props, {}, ''>;
type OptionSwatchGroupLabel = ReturnType<typeof OptionSwatchGroupLabel>;
export default OptionSwatchGroupLabel;
