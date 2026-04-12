import type { Snippet } from 'svelte';
interface Props {
	files?: File[];
	accept?: string;
	multiple?: boolean;
	maxSize?: number;
	maxFiles?: number;
	disabled?: boolean;
	onFilesChange?: (files: File[]) => void;
	class?: string;
	children: Snippet;
}
declare const FileUploadRoot: import('svelte').Component<Props, {}, 'files'>;
type FileUploadRoot = ReturnType<typeof FileUploadRoot>;
export default FileUploadRoot;
