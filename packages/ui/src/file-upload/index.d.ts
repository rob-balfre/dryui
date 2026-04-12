import type { Snippet } from 'svelte';
import type { FileUploadDropzoneProps as PrimitiveFileUploadDropzoneProps, FileUploadTriggerProps as PrimitiveFileUploadTriggerProps, FileUploadListProps as PrimitiveFileUploadListProps, FileUploadItemProps as PrimitiveFileUploadItemProps, FileUploadItemDeleteProps as PrimitiveFileUploadItemDeleteProps } from '@dryui/primitives';
export type { FileUploadRootProps } from '@dryui/primitives';
export interface FileUploadDropzoneProps extends PrimitiveFileUploadDropzoneProps {
    size?: 'sm' | 'md' | 'lg';
}
export interface FileUploadTriggerProps extends PrimitiveFileUploadTriggerProps {
    size?: 'sm' | 'md' | 'lg';
}
export interface FileUploadListProps extends PrimitiveFileUploadListProps {
    size?: 'sm' | 'md' | 'lg';
}
export interface FileUploadItemProps extends Omit<PrimitiveFileUploadItemProps, 'children'> {
    size?: 'sm' | 'md' | 'lg';
    children?: Snippet;
}
export interface FileUploadItemDeleteProps extends PrimitiveFileUploadItemDeleteProps {
}
import FileUploadRoot from './file-upload-input-root.svelte';
import FileUploadDropzone from './file-upload-dropzone.svelte';
import FileUploadTrigger from './file-upload-button-trigger.svelte';
import FileUploadList from './file-upload-list.svelte';
import FileUploadItem from './file-upload-item.svelte';
import FileUploadItemDelete from './file-upload-button-item-delete.svelte';
export declare const FileUpload: {
    Root: typeof FileUploadRoot;
    Dropzone: typeof FileUploadDropzone;
    Trigger: typeof FileUploadTrigger;
    List: typeof FileUploadList;
    Item: typeof FileUploadItem;
    ItemDelete: typeof FileUploadItemDelete;
};
