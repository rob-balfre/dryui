import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { HTMLButtonAttributes } from 'svelte/elements';
export interface AccordionRootProps extends HTMLAttributes<HTMLDivElement> {
    type?: 'single' | 'multiple';
    value?: string[];
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
    children: Snippet;
}
export interface AccordionTriggerProps extends HTMLButtonAttributes {
    children: Snippet;
}
export interface AccordionContentProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
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
