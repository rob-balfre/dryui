export type {
	CalendarRootProps,
	CalendarHeaderProps,
	CalendarGridProps,
	CalendarPrevProps,
	CalendarNextProps,
	CalendarHeadingProps
} from '@dryui/primitives';

import CalendarRoot from './calendar-root.svelte';
import CalendarHeader from './calendar-header.svelte';
import CalendarGrid from './calendar-button-grid.svelte';
import CalendarPrev from './calendar-button-prev.svelte';
import CalendarNext from './calendar-button-next.svelte';
import CalendarHeading from './calendar-heading.svelte';

export const Calendar: {
	Root: typeof CalendarRoot;
	Header: typeof CalendarHeader;
	Grid: typeof CalendarGrid;
	Prev: typeof CalendarPrev;
	Next: typeof CalendarNext;
	Heading: typeof CalendarHeading;
} = {
	Root: CalendarRoot,
	Header: CalendarHeader,
	Grid: CalendarGrid,
	Prev: CalendarPrev,
	Next: CalendarNext,
	Heading: CalendarHeading
};
