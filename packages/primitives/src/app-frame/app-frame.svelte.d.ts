import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	title?: string;
	actions?: Snippet;
	children: Snippet;
}
declare const AppFrame: import('svelte').Component<Props, {}, ''>;
type AppFrame = ReturnType<typeof AppFrame>;
export default AppFrame;
