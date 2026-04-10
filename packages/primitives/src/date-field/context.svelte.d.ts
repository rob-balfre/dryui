export type DateSegmentType = 'month' | 'day' | 'year';
export interface DateFieldContext {
    readonly value: Date | null;
    readonly locale: string;
    readonly min: Date | null;
    readonly max: Date | null;
    readonly disabled: boolean;
    readonly segmentOrder: DateSegmentType[];
    readonly separator: string;
    readonly segments: {
        type: DateSegmentType;
        value: number | null;
    }[];
    updateSegment: (type: DateSegmentType, val: number) => void;
    registerSegment: (type: DateSegmentType, el: HTMLElement) => void;
    unregisterSegment: (type: DateSegmentType) => void;
    focusSegment: (type: DateSegmentType, direction: 'next' | 'prev') => void;
}
export declare const setDateFieldCtx: (ctx: DateFieldContext) => DateFieldContext, getDateFieldCtx: () => DateFieldContext;
/**
 * Detect segment order and separator from locale using Intl.DateTimeFormat.
 */
export declare function getLocaleFormat(locale: string): {
    order: DateSegmentType[];
    separator: string;
};
