import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';

export interface CommandPaletteRootProps extends HTMLAttributes<HTMLDialogElement> {
	open?: boolean;
	children: Snippet;
}

export interface CommandPaletteInputProps extends HTMLInputAttributes {
	placeholder?: string;
}

export interface CommandPaletteListProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface CommandPaletteGroupProps extends HTMLAttributes<HTMLDivElement> {
	heading?: string;
	children: Snippet;
}

export interface CommandPaletteItemProps extends HTMLAttributes<HTMLDivElement> {
	value: string;
	disabled?: boolean;
	onSelect?: () => void;
	children: Snippet;
}

export interface CommandPaletteEmptyProps extends HTMLAttributes<HTMLDivElement> {
	children: Snippet;
}

export interface CommandPaletteSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

import CommandPaletteRoot from './command-palette-root.svelte';
import CommandPaletteInput from './command-palette-input.svelte';
import CommandPaletteList from './command-palette-list.svelte';
import CommandPaletteGroup from './command-palette-group.svelte';
import CommandPaletteItem from './command-palette-item.svelte';
import CommandPaletteEmpty from './command-palette-empty.svelte';
import CommandPaletteSeparator from './command-palette-separator.svelte';

export const CommandPalette: {
	Root: typeof CommandPaletteRoot;
	Input: typeof CommandPaletteInput;
	List: typeof CommandPaletteList;
	Group: typeof CommandPaletteGroup;
	Item: typeof CommandPaletteItem;
	Empty: typeof CommandPaletteEmpty;
	Separator: typeof CommandPaletteSeparator;
} = {
	Root: CommandPaletteRoot,
	Input: CommandPaletteInput,
	List: CommandPaletteList,
	Group: CommandPaletteGroup,
	Item: CommandPaletteItem,
	Empty: CommandPaletteEmpty,
	Separator: CommandPaletteSeparator
};
