import type { HTMLAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	children?: Snippet;
}
declare const OptionSwatchGroupMeta: import('svelte').Component<Props, {}, ''>;
type OptionSwatchGroupMeta = ReturnType<typeof OptionSwatchGroupMeta>;
export default OptionSwatchGroupMeta;
