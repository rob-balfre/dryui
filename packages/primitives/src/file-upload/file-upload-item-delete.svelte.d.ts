import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLButtonAttributes, 'children'> {
	index: number;
	children?: Snippet | undefined;
}
declare const FileUploadItemDelete: import('svelte').Component<Props, {}, ''>;
type FileUploadItemDelete = ReturnType<typeof FileUploadItemDelete>;
export default FileUploadItemDelete;
