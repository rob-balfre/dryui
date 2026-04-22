import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface ChipGroupRootProps extends HTMLAttributes<HTMLDivElement> {
	type?: 'single' | 'multiple';
	value?: string[];
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	gap?: 'sm' | 'md' | 'lg';
	justify?: 'start' | 'center' | 'end' | 'between';
	children: Snippet;
}

export interface ChipGroupItemProps extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}

export interface ChipGroupLabelProps extends HTMLAttributes<HTMLSpanElement> {
	children: Snippet;
}

import ChipGroupRoot from './chip-group-root.svelte';
import ChipGroupItem from './chip-group-item.svelte';
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
