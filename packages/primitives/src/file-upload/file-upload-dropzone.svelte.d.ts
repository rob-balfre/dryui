import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
declare const FileUploadDropzone: import('svelte').Component<Props, {}, ''>;
type FileUploadDropzone = ReturnType<typeof FileUploadDropzone>;
export default FileUploadDropzone;
