import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	children: Snippet;
}
declare const FileUploadTrigger: import('svelte').Component<Props, {}, ''>;
type FileUploadTrigger = ReturnType<typeof FileUploadTrigger>;
export default FileUploadTrigger;
