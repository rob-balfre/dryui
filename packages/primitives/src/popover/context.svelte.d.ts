interface PopoverContext {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	triggerEl: HTMLElement | null;
	toggle: () => void;
	show: () => void;
	close: () => void;
}
export declare function setPopoverCtx(ctx: PopoverContext): PopoverContext;
export declare function getPopoverCtx(): PopoverContext;
export {};
