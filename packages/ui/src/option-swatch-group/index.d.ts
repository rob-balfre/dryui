import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export type { SelectableTileGroupRootProps as OptionSwatchGroupRootProps } from '@dryui/primitives';
export type { SelectableTileGroupItemProps as OptionSwatchGroupItemProps } from '@dryui/primitives';
export type { SelectableTileGroupLabelProps as OptionSwatchGroupLabelProps } from '@dryui/primitives';
export type { SelectableTileGroupMetaProps as OptionSwatchGroupMetaProps } from '@dryui/primitives';
export interface OptionSwatchGroupSwatchProps extends HTMLAttributes<HTMLSpanElement> {
    color?: string;
    shape?: 'circle' | 'rounded';
    children?: Snippet;
}
import OptionSwatchGroupRoot from './option-swatch-group-root.svelte';
import OptionSwatchGroupItem from './option-swatch-group-item.svelte';
import OptionSwatchGroupSwatch from './option-swatch-group-swatch.svelte';
import OptionSwatchGroupLabel from './option-swatch-group-label.svelte';
import OptionSwatchGroupMeta from './option-swatch-group-meta.svelte';
export declare const OptionSwatchGroup: {
    Root: typeof OptionSwatchGroupRoot;
    Item: typeof OptionSwatchGroupItem;
    Swatch: typeof OptionSwatchGroupSwatch;
    Label: typeof OptionSwatchGroupLabel;
    Meta: typeof OptionSwatchGroupMeta;
};
