import type { Placement } from './anchor-position.svelte.js';
export type { Placement };
interface PositionedPopoverOptions {
    triggerEl: () => HTMLElement | null;
    contentEl: () => HTMLElement | null;
    placement: () => Placement;
    offset: () => number;
}
export declare function createPositionedPopover(options: PositionedPopoverOptions): {
    readonly styles: Record<string, string>;
    applyPosition: (node: HTMLElement, initialUserStyle?: string | null) => {
        update(newUserStyle?: string | null): void;
    };
    showPopover: (el: HTMLElement) => void;
    hidePopover: (el: HTMLElement) => void;
};
