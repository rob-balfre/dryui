import { createContext } from '@dryui/primitives';

export interface FileUploadContext {
	readonly files: File[];
	readonly isDragging: boolean;
	readonly disabled: boolean;
	readonly accept: string;
	readonly multiple: boolean;
	readonly maxSize: number;
	readonly maxFiles: number;
	setDragging: (value: boolean) => void;
	openFileDialog: () => void;
	addFiles: (files: FileList | File[]) => void;
	removeFile: (index: number) => void;
	clearFiles: () => void;
}
export const [setFileUploadCtx, getFileUploadCtx] = createContext<FileUploadContext>('file-upload');
