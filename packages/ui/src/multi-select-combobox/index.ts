export type {
	MultiSelectComboboxRootProps,
	MultiSelectComboboxInputProps,
	MultiSelectComboboxContentProps,
	MultiSelectComboboxGroupProps,
	MultiSelectComboboxItemProps,
	MultiSelectComboboxEmptyProps,
	MultiSelectComboboxSelectionListProps,
	MultiSelectComboboxSelectionItemProps,
	MultiSelectComboboxSelectionRemoveProps
} from '@dryui/primitives';

import MultiSelectComboboxRoot from './multi-select-combobox-root-input.svelte';
import MultiSelectComboboxInput from './multi-select-combobox-input.svelte';
import MultiSelectComboboxContent from './multi-select-combobox-content.svelte';
import MultiSelectComboboxGroup from './multi-select-combobox-group.svelte';
import MultiSelectComboboxItem from './multi-select-combobox-item.svelte';
import MultiSelectComboboxEmpty from './multi-select-combobox-empty.svelte';
import MultiSelectComboboxSelectionList from './multi-select-combobox-selection-list.svelte';
import MultiSelectComboboxSelectionItem from './multi-select-combobox-selection-item.svelte';
import MultiSelectComboboxSelectionRemove from './multi-select-combobox-selection-remove-button.svelte';

export const MultiSelectCombobox: {
	Root: typeof MultiSelectComboboxRoot;
	Input: typeof MultiSelectComboboxInput;
	Content: typeof MultiSelectComboboxContent;
	Group: typeof MultiSelectComboboxGroup;
	Item: typeof MultiSelectComboboxItem;
	Empty: typeof MultiSelectComboboxEmpty;
	SelectionList: typeof MultiSelectComboboxSelectionList;
	SelectionItem: typeof MultiSelectComboboxSelectionItem;
	SelectionRemove: typeof MultiSelectComboboxSelectionRemove;
} = {
	Root: MultiSelectComboboxRoot,
	Input: MultiSelectComboboxInput,
	Content: MultiSelectComboboxContent,
	Group: MultiSelectComboboxGroup,
	Item: MultiSelectComboboxItem,
	Empty: MultiSelectComboboxEmpty,
	SelectionList: MultiSelectComboboxSelectionList,
	SelectionItem: MultiSelectComboboxSelectionItem,
	SelectionRemove: MultiSelectComboboxSelectionRemove
};
