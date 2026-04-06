import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	position?: 'bottom-right' | 'bottom-left';
	children: Snippet;
}
declare const FloatButtonRoot: import('svelte').Component<Props, {}, 'open'>;
type FloatButtonRoot = ReturnType<typeof FloatButtonRoot>;
export default FloatButtonRoot;
