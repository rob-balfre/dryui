import type { Snippet } from 'svelte';
interface Props {
	files?: File[];
	accept?: string | undefined;
	multiple?: boolean | undefined;
	maxSize?: number | undefined;
	maxFiles?: number | undefined;
	disabled?: boolean | undefined;
	onFilesChange?: ((files: File[]) => void) | undefined;
	children: Snippet;
}
declare const FileUploadRoot: import('svelte').Component<Props, {}, 'files'>;
type FileUploadRoot = ReturnType<typeof FileUploadRoot>;
export default FileUploadRoot;
