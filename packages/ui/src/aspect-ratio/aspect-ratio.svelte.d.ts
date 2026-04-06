import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	ratio?: number;
	children: Snippet;
}
declare const AspectRatio: import('svelte').Component<Props, {}, ''>;
type AspectRatio = ReturnType<typeof AspectRatio>;
export default AspectRatio;
