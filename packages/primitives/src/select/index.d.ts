import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';
export interface SelectRootProps {
    open?: boolean;
    value?: string;
    disabled?: boolean;
    name?: string;
    options?: Array<string | {
        value: string;
        label: string;
    }>;
    placeholder?: string;
    children?: Snippet;
}
export interface SelectTriggerProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface SelectContentProps extends HTMLAttributes<HTMLDivElement> {
    placement?: Placement;
    offset?: number;
    children: Snippet;
}
export interface SelectItemProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    disabled?: boolean;
    children: Snippet;
}
export interface SelectValueProps extends HTMLAttributes<HTMLSpanElement> {
    placeholder?: string;
}
import SelectRoot from './select-root.svelte';
import SelectTrigger from './select-trigger.svelte';
import SelectContent from './select-content.svelte';
import SelectItem from './select-item.svelte';
import SelectValue from './select-value.svelte';
export declare const Select: {
    Root: typeof SelectRoot;
    Trigger: typeof SelectTrigger;
    Content: typeof SelectContent;
    Item: typeof SelectItem;
    Value: typeof SelectValue;
};
