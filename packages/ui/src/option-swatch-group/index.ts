import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	SelectableTileGroupItemProps as PrimitiveOptionSwatchGroupItemProps,
	SelectableTileGroupRootProps as PrimitiveOptionSwatchGroupRootProps
} from '@dryui/primitives';

export type { SelectableTileGroupLabelProps as OptionSwatchGroupLabelProps } from '@dryui/primitives';
export type { SelectableTileGroupMetaProps as OptionSwatchGroupMetaProps } from '@dryui/primitives';

export interface OptionSwatchGroupRootProps extends PrimitiveOptionSwatchGroupRootProps {
	columns?: 1 | 2 | 3 | 4;
}

export interface OptionSwatchGroupItemProps extends PrimitiveOptionSwatchGroupItemProps {
	size?: 'default' | 'compact';
	unavailable?: boolean;
}

export interface OptionSwatchGroupSwatchProps extends HTMLAttributes<HTMLSpanElement> {
	color?: string;
	shape?: 'circle' | 'rounded';
	children?: Snippet;
}

import OptionSwatchGroupRoot from './option-swatch-group-root.svelte';
import OptionSwatchGroupItem from './option-swatch-group-item-button.svelte';
import OptionSwatchGroupSwatch from './option-swatch-group-swatch.svelte';
import OptionSwatchGroupLabel from './option-swatch-group-label.svelte';
import OptionSwatchGroupMeta from './option-swatch-group-meta.svelte';

export const OptionSwatchGroup: {
	Root: typeof OptionSwatchGroupRoot;
	Item: typeof OptionSwatchGroupItem;
	Swatch: typeof OptionSwatchGroupSwatch;
	Label: typeof OptionSwatchGroupLabel;
	Meta: typeof OptionSwatchGroupMeta;
} = {
	Root: OptionSwatchGroupRoot,
	Item: OptionSwatchGroupItem,
	Swatch: OptionSwatchGroupSwatch,
	Label: OptionSwatchGroupLabel,
	Meta: OptionSwatchGroupMeta
};
