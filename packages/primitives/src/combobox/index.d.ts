import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { Placement } from '../utils/anchor-position.svelte.js';
export interface ComboboxRootProps {
	open?: boolean;
	value?: string;
	disabled?: boolean;
	name?: string;
	children: Snippet;
}
export interface ComboboxInputProps extends HTMLInputAttributes {
	placeholder?: string;
}
export interface ComboboxContentProps extends HTMLAttributes<HTMLDivElement> {
	placement?: Placement;
	offset?: number;
	loading?: boolean;
	loadingContent?: Snippet;
	children: Snippet;
}
export interface ComboboxItemProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	index: number;
	disabled?: boolean;
	icon?: Snippet;
	children: Snippet;
}
export interface ComboboxEmptyProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}
export interface ComboboxGroupProps extends HTMLAttributes<HTMLDivElement> {
	label: string;
	children: Snippet;
}
import ComboboxRoot from './combobox-root.svelte';
import ComboboxInput from './combobox-input.svelte';
import ComboboxContent from './combobox-content.svelte';
import ComboboxItem from './combobox-item.svelte';
import ComboboxEmpty from './combobox-empty.svelte';
import ComboboxGroup from './combobox-group.svelte';
export { getComboboxCtx } from './context.svelte.js';
export declare const Combobox: {
	Root: typeof ComboboxRoot;
	Input: typeof ComboboxInput;
	Content: typeof ComboboxContent;
	Item: typeof ComboboxItem;
	Empty: typeof ComboboxEmpty;
	Group: typeof ComboboxGroup;
};
