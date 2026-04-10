import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ComboboxInputProps as PrimitiveComboboxInputProps } from '@dryui/primitives';
export type { ComboboxRootProps, ComboboxContentProps, ComboboxItemProps, ComboboxEmptyProps } from '@dryui/primitives';
export interface ComboboxInputProps extends Omit<PrimitiveComboboxInputProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
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
export declare const Combobox: {
    Root: typeof ComboboxRoot;
    Input: typeof ComboboxInput;
    Content: typeof ComboboxContent;
    Item: typeof ComboboxItem;
    Empty: typeof ComboboxEmpty;
    Group: typeof ComboboxGroup;
};
