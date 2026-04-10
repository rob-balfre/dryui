import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface ChipGroupRootProps extends HTMLAttributes<HTMLDivElement> {
    type?: 'single' | 'multiple';
    value?: string[];
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export interface ChipGroupItemProps extends HTMLButtonAttributes {
    value: string;
    disabled?: boolean;
    children: Snippet;
}
import ChipGroupRoot from './chip-group-root.svelte';
import ChipGroupItem from './chip-group-item.svelte';
export declare const ChipGroup: {
    Root: typeof ChipGroupRoot;
    Item: typeof ChipGroupItem;
};
