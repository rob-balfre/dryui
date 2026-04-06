import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
export interface SelectableTileGroupRootProps extends HTMLAttributes<HTMLDivElement> {
    value?: string;
    disabled?: boolean;
    orientation?: 'horizontal' | 'vertical';
    children: Snippet;
}
export interface SelectableTileGroupItemProps extends Omit<HTMLButtonAttributes, 'value'> {
    value: string;
    disabled?: boolean;
    children: Snippet;
}
export interface SelectableTileGroupIndicatorProps extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
}
export interface SelectableTileGroupLabelProps extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
}
export interface SelectableTileGroupDescriptionProps extends HTMLAttributes<HTMLDivElement> {
    children?: Snippet;
}
export interface SelectableTileGroupMetaProps extends HTMLAttributes<HTMLSpanElement> {
    children?: Snippet;
}
import SelectableTileGroupRoot from './selectable-tile-group-root.svelte';
import SelectableTileGroupItem from './selectable-tile-group-item.svelte';
import SelectableTileGroupIndicator from './selectable-tile-group-indicator.svelte';
import SelectableTileGroupLabel from './selectable-tile-group-label.svelte';
import SelectableTileGroupDescription from './selectable-tile-group-description.svelte';
import SelectableTileGroupMeta from './selectable-tile-group-meta.svelte';
export declare const SelectableTileGroup: {
    Root: typeof SelectableTileGroupRoot;
    Item: typeof SelectableTileGroupItem;
    Indicator: typeof SelectableTileGroupIndicator;
    Label: typeof SelectableTileGroupLabel;
    Description: typeof SelectableTileGroupDescription;
    Meta: typeof SelectableTileGroupMeta;
};
