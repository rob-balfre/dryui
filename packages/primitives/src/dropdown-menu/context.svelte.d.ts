export interface DropdownMenuContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
}
export declare function setDropdownMenuCtx(ctx: DropdownMenuContext): DropdownMenuContext;
export declare function getDropdownMenuCtx(): DropdownMenuContext;
