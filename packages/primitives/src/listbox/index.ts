import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

export interface ListboxRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: string | string[];
	multiple?: boolean;
	disabled?: boolean;
	onvaluechange?: (value: string | string[]) => void;
	children: Snippet;
}

export interface ListboxItemProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	children: Snippet;
}

export { default as ListboxRoot } from './listbox-root.svelte';
export { default as ListboxItem } from './listbox-item.svelte';

import ListboxRoot from './listbox-root.svelte';
import ListboxItem from './listbox-item.svelte';

export const Listbox: {
	Root: typeof ListboxRoot;
	Item: typeof ListboxItem;
} = {
	Root: ListboxRoot,
	Item: ListboxItem
};
