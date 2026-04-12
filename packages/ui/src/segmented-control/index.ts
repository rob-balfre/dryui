export type { SegmentedControlRootProps, SegmentedControlItemProps } from '@dryui/primitives';

import SegmentedControlRoot from './segmented-control-root.svelte';
import SegmentedControlItem from './segmented-control-item-button.svelte';

export const SegmentedControl: {
	Root: typeof SegmentedControlRoot;
	Item: typeof SegmentedControlItem;
} = {
	Root: SegmentedControlRoot,
	Item: SegmentedControlItem
};
