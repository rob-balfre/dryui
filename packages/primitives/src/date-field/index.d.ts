import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type { DateSegmentType } from './context.svelte.js';
export interface DateFieldRootProps extends HTMLAttributes<HTMLDivElement> {
    value?: Date | null;
    name?: string;
    locale?: string;
    min?: Date | null;
    max?: Date | null;
    disabled?: boolean;
    children: Snippet;
}
export interface DateFieldSegmentProps extends HTMLAttributes<HTMLSpanElement> {
    type: 'month' | 'day' | 'year';
}
export interface DateFieldSeparatorProps extends HTMLAttributes<HTMLSpanElement> {
    separator?: string;
}
import DateFieldRoot from './date-field-root.svelte';
import DateFieldSegment from './date-field-segment.svelte';
import DateFieldSeparator from './date-field-separator.svelte';
export declare const DateField: {
    Root: typeof DateFieldRoot;
    Segment: typeof DateFieldSegment;
    Separator: typeof DateFieldSeparator;
};
