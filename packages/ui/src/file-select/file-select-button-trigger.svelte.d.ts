import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}
declare const FileSelectTrigger: import('svelte').Component<Props, {}, ''>;
type FileSelectTrigger = ReturnType<typeof FileSelectTrigger>;
export default FileSelectTrigger;
