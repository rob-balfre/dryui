export type { ListboxRootProps, ListboxItemProps } from '@dryui/primitives';

import ListboxRoot from './listbox-root.svelte';
import ListboxItem from './listbox-item.svelte';

export const Listbox: {
	Root: typeof ListboxRoot;
	Item: typeof ListboxItem;
} = {
	Root: ListboxRoot,
	Item: ListboxItem
};
