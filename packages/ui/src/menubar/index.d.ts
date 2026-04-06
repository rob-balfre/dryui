export type {
	MenubarRootProps,
	MenubarMenuProps,
	MenubarTriggerProps,
	MenubarContentProps,
	MenubarItemProps,
	MenubarSeparatorProps,
	MenubarLabelProps
} from '@dryui/primitives';
import MenubarRoot from './menubar-root.svelte';
import MenubarMenu from './menubar-menu.svelte';
import MenubarTrigger from './menubar-trigger.svelte';
import MenubarContent from './menubar-content.svelte';
import MenubarItem from './menubar-item.svelte';
import MenubarSeparator from './menubar-separator.svelte';
import MenubarLabel from './menubar-label.svelte';
export declare const Menubar: {
	Root: typeof MenubarRoot;
	Menu: typeof MenubarMenu;
	Trigger: typeof MenubarTrigger;
	Content: typeof MenubarContent;
	Item: typeof MenubarItem;
	Separator: typeof MenubarSeparator;
	Label: typeof MenubarLabel;
};
