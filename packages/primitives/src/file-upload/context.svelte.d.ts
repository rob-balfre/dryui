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
export declare const setFileUploadCtx: (ctx: FileUploadContext) => FileUploadContext, getFileUploadCtx: () => FileUploadContext;
