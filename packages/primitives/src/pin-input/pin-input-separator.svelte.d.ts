import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}
declare const PinInputSeparator: import('svelte').Component<Props, {}, ''>;
type PinInputSeparator = ReturnType<typeof PinInputSeparator>;
export default PinInputSeparator;
