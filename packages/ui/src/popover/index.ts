export type { PopoverRootProps, PopoverTriggerProps, PopoverContentProps } from '@dryui/primitives';

import PopoverRoot from './popover-root.svelte';
import PopoverTrigger from './popover-trigger.svelte';
import PopoverContent from './popover-content.svelte';

export const Popover: {
	Root: typeof PopoverRoot;
	Trigger: typeof PopoverTrigger;
	Content: typeof PopoverContent;
} = {
	Root: PopoverRoot,
	Trigger: PopoverTrigger,
	Content: PopoverContent
};
