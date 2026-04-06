import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	open?: boolean;
	invisible?: boolean;
	children?: Snippet;
}
declare const Backdrop: import('svelte').Component<Props, {}, ''>;
type Backdrop = ReturnType<typeof Backdrop>;
export default Backdrop;
