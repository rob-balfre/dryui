export interface ToastData {
    id: string;
    variant: 'info' | 'success' | 'warning' | 'error';
    title?: string;
    description?: string;
    duration: number;
    persistent?: boolean;
}
type ToastOptions = Partial<Omit<ToastData, 'id' | 'variant'>>;
declare function createToastStore(): {
    readonly toasts: ToastData[];
    add: (toast: Omit<ToastData, "id">) => string;
    remove: (id: string) => void;
    info(title: string, opts?: ToastOptions): string;
    success(title: string, opts?: ToastOptions): string;
    warning(title: string, opts?: ToastOptions): string;
    error(title: string, opts?: ToastOptions): string;
};
export { createToastStore };
export declare const toastStore: {
    readonly toasts: ToastData[];
    add: (toast: Omit<ToastData, "id">) => string;
    remove: (id: string) => void;
    info(title: string, opts?: ToastOptions): string;
    success(title: string, opts?: ToastOptions): string;
    warning(title: string, opts?: ToastOptions): string;
    error(title: string, opts?: ToastOptions): string;
};
