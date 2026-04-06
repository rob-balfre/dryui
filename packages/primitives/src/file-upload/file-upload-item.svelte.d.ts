import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLLIElement> {
	file: File;
	index: number;
	children: Snippet;
}
declare const FileUploadItem: import('svelte').Component<Props, {}, ''>;
type FileUploadItem = ReturnType<typeof FileUploadItem>;
export default FileUploadItem;
