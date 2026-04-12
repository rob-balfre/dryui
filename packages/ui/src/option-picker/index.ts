import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	SelectableTileGroupDescriptionProps,
	SelectableTileGroupItemProps as PrimitiveOptionPickerItemProps,
	SelectableTileGroupLabelProps as OptionPickerLabelProps,
	SelectableTileGroupMetaProps as OptionPickerMetaProps,
	SelectableTileGroupRootProps as PrimitiveOptionPickerRootProps
} from '@dryui/primitives';

export interface OptionPickerRootProps extends PrimitiveOptionPickerRootProps {
	columns?: 1 | 2 | 3 | 4;
}

export interface OptionPickerItemProps extends PrimitiveOptionPickerItemProps {
	layout?: 'inline' | 'stacked';
	size?: 'default' | 'compact' | 'visual';
	unavailable?: boolean;
}

export interface OptionPickerPreviewProps extends HTMLAttributes<HTMLSpanElement> {
	color?: string;
	shape?: 'circle' | 'rounded' | 'square' | 'pill';
	variant?: 'default' | 'preset' | 'font' | 'shape';
	children?: Snippet;
}

export type { OptionPickerLabelProps, OptionPickerMetaProps };
export type { SelectableTileGroupDescriptionProps as OptionPickerDescriptionProps };

import OptionPickerRoot from './option-picker-root.svelte';
import OptionPickerItem from './option-picker-item.svelte';
import OptionPickerPreview from './option-picker-preview.svelte';
import OptionPickerLabel from './option-picker-label.svelte';
import OptionPickerDescription from './option-picker-description.svelte';
import OptionPickerMeta from './option-picker-meta.svelte';

export const OptionPicker: {
	Root: typeof OptionPickerRoot;
	Item: typeof OptionPickerItem;
	Preview: typeof OptionPickerPreview;
	Label: typeof OptionPickerLabel;
	Description: typeof OptionPickerDescription;
	Meta: typeof OptionPickerMeta;
} = {
	Root: OptionPickerRoot,
	Item: OptionPickerItem,
	Preview: OptionPickerPreview,
	Label: OptionPickerLabel,
	Description: OptionPickerDescription,
	Meta: OptionPickerMeta
};
