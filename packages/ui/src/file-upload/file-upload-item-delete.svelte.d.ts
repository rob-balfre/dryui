import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends HTMLButtonAttributes {
	index: number;
	children?: Snippet;
}
declare const FileUploadItemDelete: import('svelte').Component<Props, {}, ''>;
type FileUploadItemDelete = ReturnType<typeof FileUploadItemDelete>;
export default FileUploadItemDelete;
