export type {
	SelectRootProps,
	SelectContentProps,
	SelectItemProps,
	SelectValueProps
} from '@dryui/primitives';
import type { Snippet } from 'svelte';
import type { HTMLButtonAttributes } from 'svelte/elements';

export interface SelectTriggerProps extends Omit<HTMLButtonAttributes, 'children'> {
	size?: 'sm' | 'md' | 'lg';
	children: Snippet;
}

import SelectRoot from './select-root-input.svelte';
import SelectTrigger from './select-trigger-button.svelte';
import SelectContent from './select-content.svelte';
import SelectItem from './select-item.svelte';
import SelectValue from './select-value.svelte';

export const Select: {
	Root: typeof SelectRoot;
	Trigger: typeof SelectTrigger;
	Content: typeof SelectContent;
	Item: typeof SelectItem;
	Value: typeof SelectValue;
} = {
	Root: SelectRoot,
	Trigger: SelectTrigger,
	Content: SelectContent,
	Item: SelectItem,
	Value: SelectValue
};
