export interface FormControlContext {
    readonly id: string;
    readonly labelId: string;
    readonly descriptionId: string;
    readonly errorId: string;
    readonly describedBy: string | undefined;
    readonly errorMessageId: string | undefined;
    readonly error: string;
    readonly required: boolean;
    readonly disabled: boolean;
    readonly hasError: boolean;
    registerDescription: (mounted: boolean) => void;
    registerError: (mounted: boolean) => void;
}
export declare function setFormControlCtx(ctx: FormControlContext): FormControlContext;
export declare function getFormControlCtx(): FormControlContext | undefined;
export declare function generateFormId(prefix: string): string;
