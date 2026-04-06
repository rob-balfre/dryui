import type { Snippet } from 'svelte';
import type { HTMLImgAttributes } from 'svelte/elements';
interface Props extends HTMLImgAttributes {
	fallback?: string;
	fallbackSnippet?: Snippet;
}
declare const Image: import('svelte').Component<Props, {}, ''>;
type Image = ReturnType<typeof Image>;
export default Image;
