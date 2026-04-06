export interface SelectContext {
	readonly open: boolean;
	readonly value: string;
	readonly displayText: string;
	readonly triggerId: string;
	readonly contentId: string;
	readonly disabled: boolean;
	triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
	select: (value: string, text: string) => void;
}
export declare function setSelectCtx(ctx: SelectContext): SelectContext;
export declare function getSelectCtx(): SelectContext;
