import type {
	ChipGroupRootProps as PrimitiveChipGroupRootProps,
	ChipGroupLabelProps as PrimitiveChipGroupLabelProps
} from '@dryui/primitives';

export type { ChipGroupItemProps } from '@dryui/primitives';

export interface ChipGroupRootProps extends PrimitiveChipGroupRootProps {
	size?: 'sm' | 'md';
}

export type ChipGroupLabelProps = PrimitiveChipGroupLabelProps;

import ChipGroupRoot from './chip-group-root.svelte';
import ChipGroupItem from './chip-group-button-item.svelte';
import ChipGroupLabel from './chip-group-label.svelte';

export const ChipGroup: {
	Root: typeof ChipGroupRoot;
	Item: typeof ChipGroupItem;
	Label: typeof ChipGroupLabel;
} = {
	Root: ChipGroupRoot,
	Item: ChipGroupItem,
	Label: ChipGroupLabel
};
