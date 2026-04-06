export type {
	CommandPaletteRootProps,
	CommandPaletteInputProps,
	CommandPaletteListProps,
	CommandPaletteGroupProps,
	CommandPaletteItemProps,
	CommandPaletteEmptyProps,
	CommandPaletteSeparatorProps
} from '@dryui/primitives';

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
