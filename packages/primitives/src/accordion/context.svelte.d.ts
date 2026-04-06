interface AccordionContext {
	readonly type: 'single' | 'multiple';
	readonly orientation: 'horizontal' | 'vertical';
	value: string[];
	toggle: (itemValue: string) => void;
	isOpen: (itemValue: string) => boolean;
}
export declare function setAccordionCtx(ctx: AccordionContext): AccordionContext;
export declare function getAccordionCtx(): AccordionContext;
interface AccordionItemContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly open: boolean;
}
export declare function setAccordionItemCtx(ctx: AccordionItemContext): AccordionItemContext;
export declare function getAccordionItemCtx(): AccordionItemContext;
export {};
