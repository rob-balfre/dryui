export type {
	AccordionRootProps,
	AccordionItemProps,
	AccordionTriggerProps,
	AccordionContentProps
} from '@dryui/primitives';
import AccordionRoot from './accordion-root.svelte';
import AccordionItem from './accordion-item.svelte';
import AccordionTrigger from './accordion-trigger.svelte';
import AccordionContent from './accordion-content.svelte';
export declare const Accordion: {
	Root: typeof AccordionRoot;
	Item: typeof AccordionItem;
	Trigger: typeof AccordionTrigger;
	Content: typeof AccordionContent;
};
