export interface FileSelectContext {
    readonly value: string | null;
    readonly loading: boolean;
    readonly disabled: boolean;
    request: () => void;
    clear: () => void;
}
export declare const setFileSelectCtx: (ctx: FileSelectContext) => FileSelectContext, getFileSelectCtx: () => FileSelectContext;
