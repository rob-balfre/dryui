import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface ToggleGroupRootProps extends HTMLAttributes<HTMLDivElement> {
	type?: 'single' | 'multiple';
	value?: string[];
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
	children: Snippet;
}

export interface ToggleGroupItemProps extends HTMLButtonAttributes {
	value: string;
	disabled?: boolean;
	children: Snippet;
}

import ToggleGroupRoot from './toggle-group-root.svelte';
import ToggleGroupItem from './toggle-group-item.svelte';

export const ToggleGroup: {
	Root: typeof ToggleGroupRoot;
	Item: typeof ToggleGroupItem;
} = {
	Root: ToggleGroupRoot,
	Item: ToggleGroupItem
};
