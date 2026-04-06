export type {
	MegaMenuRootProps,
	MegaMenuItemProps,
	MegaMenuTriggerProps,
	MegaMenuPanelProps,
	MegaMenuColumnProps,
	MegaMenuLinkProps
} from '@dryui/primitives';
import MegaMenuRoot from './mega-menu-root.svelte';
import MegaMenuItem from './mega-menu-item.svelte';
import MegaMenuTrigger from './mega-menu-trigger.svelte';
import MegaMenuPanel from './mega-menu-panel.svelte';
import MegaMenuColumn from './mega-menu-column.svelte';
import MegaMenuLink from './mega-menu-link.svelte';
export declare const MegaMenu: {
	Root: typeof MegaMenuRoot;
	Item: typeof MegaMenuItem;
	Trigger: typeof MegaMenuTrigger;
	Panel: typeof MegaMenuPanel;
	Column: typeof MegaMenuColumn;
	Link: typeof MegaMenuLink;
};
