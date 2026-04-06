import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
	size?: 'sm' | 'md' | 'lg';
	children: Snippet<
		[
			{
				file: File;
				index: number;
			}
		]
	>;
}
declare const FileUploadList: import('svelte').Component<Props, {}, ''>;
type FileUploadList = ReturnType<typeof FileUploadList>;
export default FileUploadList;
