import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export type { FileUploadContext } from './context.svelte.js';
export { getFileUploadCtx, setFileUploadCtx } from './context.svelte.js';

export interface FileUploadRootProps {
	files?: File[];
	accept?: string | undefined;
	multiple?: boolean | undefined;
	maxSize?: number | undefined;
	maxFiles?: number | undefined;
	disabled?: boolean | undefined;
	onFilesChange?: ((files: File[]) => void) | undefined;
	children: Snippet;
}

export interface FileUploadDropzoneProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface FileUploadTriggerProps extends HTMLButtonAttributes {
	children: Snippet;
}

export interface FileUploadListProps extends Omit<HTMLAttributes<HTMLUListElement>, 'children'> {
	children: Snippet<[{ file: File; index: number }]>;
}

export interface FileUploadItemProps extends HTMLAttributes<HTMLLIElement> {
	file: File;
	index: number;
	children: Snippet;
}

export interface FileUploadItemDeleteProps extends Omit<HTMLButtonAttributes, 'children'> {
	index: number;
	children?: Snippet | undefined;
}

import FileUploadRoot from './file-upload-root.svelte';
import FileUploadDropzone from './file-upload-dropzone.svelte';
import FileUploadTrigger from './file-upload-trigger.svelte';
import FileUploadList from './file-upload-list.svelte';
import FileUploadItem from './file-upload-item.svelte';
import FileUploadItemDelete from './file-upload-item-delete.svelte';

export const FileUpload: {
	Root: typeof FileUploadRoot;
	Dropzone: typeof FileUploadDropzone;
	Trigger: typeof FileUploadTrigger;
	List: typeof FileUploadList;
	Item: typeof FileUploadItem;
	ItemDelete: typeof FileUploadItemDelete;
} = {
	Root: FileUploadRoot,
	Dropzone: FileUploadDropzone,
	Trigger: FileUploadTrigger,
	List: FileUploadList,
	Item: FileUploadItem,
	ItemDelete: FileUploadItemDelete
};
