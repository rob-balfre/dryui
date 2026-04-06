import type { ChipGroupRootProps as PrimitiveChipGroupRootProps } from '@dryui/primitives';

export type { ChipGroupItemProps } from '@dryui/primitives';

export interface ChipGroupRootProps extends PrimitiveChipGroupRootProps {
	size?: 'sm' | 'md';
}

import ChipGroupRoot from './chip-group-root.svelte';
import ChipGroupItem from './chip-group-item.svelte';

export const ChipGroup: {
	Root: typeof ChipGroupRoot;
	Item: typeof ChipGroupItem;
} = {
	Root: ChipGroupRoot,
	Item: ChipGroupItem
};
