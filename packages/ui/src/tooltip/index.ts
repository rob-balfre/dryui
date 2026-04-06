export type { TooltipRootProps, TooltipTriggerProps, TooltipContentProps } from '@dryui/primitives';

import TooltipRoot from './tooltip-root.svelte';
import TooltipTrigger from './tooltip-trigger.svelte';
import TooltipContent from './tooltip-content.svelte';

export const Tooltip: {
	Root: typeof TooltipRoot;
	Trigger: typeof TooltipTrigger;
	Content: typeof TooltipContent;
} = {
	Root: TooltipRoot,
	Trigger: TooltipTrigger,
	Content: TooltipContent
};
