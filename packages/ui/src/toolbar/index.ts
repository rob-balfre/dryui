export type {
	ToolbarRootProps,
	ToolbarButtonProps,
	ToolbarSeparatorProps,
	ToolbarLinkProps
} from '@dryui/primitives';

import ToolbarRoot from './toolbar-root.svelte';
import ToolbarButton from './toolbar-button.svelte';
import ToolbarSeparator from './toolbar-separator.svelte';
import ToolbarLink from './toolbar-link.svelte';

export const Toolbar: {
	Root: typeof ToolbarRoot;
	Button: typeof ToolbarButton;
	Separator: typeof ToolbarSeparator;
	Link: typeof ToolbarLink;
} = {
	Root: ToolbarRoot,
	Button: ToolbarButton,
	Separator: ToolbarSeparator,
	Link: ToolbarLink
};
