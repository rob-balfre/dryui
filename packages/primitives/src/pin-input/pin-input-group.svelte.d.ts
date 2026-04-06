import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const PinInputGroup: import('svelte').Component<Props, {}, ''>;
type PinInputGroup = ReturnType<typeof PinInputGroup>;
export default PinInputGroup;
