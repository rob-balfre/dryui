export type {
	HoverCardRootProps,
	HoverCardTriggerProps,
	HoverCardContentProps
} from '@dryui/primitives';

import HoverCardRoot from './hover-card-root.svelte';
import HoverCardTrigger from './hover-card-trigger.svelte';
import HoverCardContent from './hover-card-content.svelte';

export const HoverCard: {
	Root: typeof HoverCardRoot;
	Trigger: typeof HoverCardTrigger;
	Content: typeof HoverCardContent;
} = {
	Root: HoverCardRoot,
	Trigger: HoverCardTrigger,
	Content: HoverCardContent
};
