import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';
export interface MultiSelectComboboxRootProps extends HTMLAttributes<HTMLDivElement> {
    value?: string[];
    query?: string;
    open?: boolean;
    disabled?: boolean;
    name?: string;
    maxSelections?: number;
    onvaluechange?: (value: string[]) => void;
    onquerychange?: (query: string) => void;
    children: Snippet;
}
export interface MultiSelectComboboxInputProps extends HTMLInputAttributes {
    placeholder?: string;
}
export interface MultiSelectComboboxContentProps extends HTMLAttributes<HTMLDivElement> {
    placement?: Placement;
    offset?: number;
    loading?: boolean;
    loadingContent?: Snippet;
    children: Snippet;
}
export interface MultiSelectComboboxGroupProps extends HTMLAttributes<HTMLDivElement> {
    label: string;
    children: Snippet;
}
export interface MultiSelectComboboxItemProps extends HTMLAttributes<HTMLDivElement> {
    value: string;
    textValue?: string;
    disabled?: boolean;
    icon?: Snippet;
    children: Snippet;
}
export interface MultiSelectComboboxEmptyProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface MultiSelectComboboxSelectionListProps extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
}
export interface MultiSelectComboboxSelectionItemProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
    value: string;
    children?: Snippet | undefined;
}
export interface MultiSelectComboboxSelectionRemoveProps extends HTMLButtonAttributes {
    value: string;
    label?: string | undefined;
}
import MultiSelectComboboxRoot from './multi-select-combobox-root.svelte';
import MultiSelectComboboxInput from './multi-select-combobox-input.svelte';
import MultiSelectComboboxContent from './multi-select-combobox-content.svelte';
import MultiSelectComboboxGroup from './multi-select-combobox-group.svelte';
import MultiSelectComboboxItem from './multi-select-combobox-item.svelte';
import MultiSelectComboboxEmpty from './multi-select-combobox-empty.svelte';
import MultiSelectComboboxSelectionList from './multi-select-combobox-selection-list.svelte';
import MultiSelectComboboxSelectionItem from './multi-select-combobox-selection-item.svelte';
import MultiSelectComboboxSelectionRemove from './multi-select-combobox-selection-remove.svelte';
export { getMultiSelectComboboxCtx } from './context.svelte.js';
export declare const MultiSelectCombobox: {
    Root: typeof MultiSelectComboboxRoot;
    Input: typeof MultiSelectComboboxInput;
    Content: typeof MultiSelectComboboxContent;
    Group: typeof MultiSelectComboboxGroup;
    Item: typeof MultiSelectComboboxItem;
    Empty: typeof MultiSelectComboboxEmpty;
    SelectionList: typeof MultiSelectComboboxSelectionList;
    SelectionItem: typeof MultiSelectComboboxSelectionItem;
    SelectionRemove: typeof MultiSelectComboboxSelectionRemove;
};
