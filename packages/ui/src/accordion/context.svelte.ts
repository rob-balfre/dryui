import { createContext } from '@dryui/primitives';

interface AccordionContext {
	readonly type: 'single' | 'multiple';
	readonly orientation: 'horizontal' | 'vertical';
	value: string[];
	toggle: (itemValue: string) => void;
	isOpen: (itemValue: string) => boolean;
}
export const [setAccordionCtx, getAccordionCtx] = createContext<AccordionContext>('accordion');

interface AccordionItemContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly open: boolean;
	readonly contentId: string;
}
export const [setAccordionItemCtx, getAccordionItemCtx] =
	createContext<AccordionItemContext>('accordion-item');
