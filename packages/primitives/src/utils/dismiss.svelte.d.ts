export interface DismissOptions {
	onDismiss: () => void;
	escapeKey?: boolean;
	clickOutside?: boolean;
	containerEl?: () => HTMLElement | null;
}
export declare function createDismiss(options: DismissOptions): void;
