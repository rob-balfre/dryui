export type Placement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
export interface AnchorPositionOptions {
    placement?: Placement;
    offset?: number;
}
export declare function createAnchorPosition(referenceEl: () => HTMLElement | null, floatingEl: () => HTMLElement | null, options?: AnchorPositionOptions): {
    readonly styles: Record<string, string>;
};
