export type { TourStep, TourRootProps, TourTooltipProps } from '@dryui/primitives';

import TourRoot from './tour-root.svelte';
import TourTooltip from './tour-tooltip.svelte';

export const Tour: {
	Root: typeof TourRoot;
	Tooltip: typeof TourTooltip;
} = {
	Root: TourRoot,
	Tooltip: TourTooltip
};
