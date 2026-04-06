import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface SegmentedControlRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: string;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}

export interface SegmentedControlItemProps extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}

import SegmentedControlRoot from './segmented-control-root.svelte';
import SegmentedControlItem from './segmented-control-item.svelte';

export const SegmentedControl: {
	Root: typeof SegmentedControlRoot;
	Item: typeof SegmentedControlItem;
} = {
	Root: SegmentedControlRoot,
	Item: SegmentedControlItem
};
