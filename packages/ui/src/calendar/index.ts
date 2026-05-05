export type {
	CalendarRootProps,
	CalendarHeaderProps,
	CalendarPrevProps,
	CalendarNextProps,
	CalendarHeadingProps
} from '@dryui/primitives';
import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';
export type {
	CalendarEventDisplay,
	CalendarEventItem,
	CalendarEventPosition,
	CalendarEventRenderContext,
	CalendarEventTone,
	CalendarVisibleMonths
} from '../internal/calendar-event-layout.js';

export interface CalendarGridProps extends CalendarEventGridProps {}

export type {
	CalendarEvent,
	CalendarEventCategory,
	CalendarView,
	PositionedEvent,
	DayBandEvent
} from './types.js';

export type { CalendarWeekProps } from './calendar-week.svelte';

import CalendarRoot from './calendar-root.svelte';
import CalendarHeader from './calendar-header.svelte';
import CalendarGrid from './calendar-button-grid.svelte';
import CalendarWeek from './calendar-week.svelte';
import CalendarPrev from './calendar-button-prev.svelte';
import CalendarNext from './calendar-button-next.svelte';
import CalendarHeading from './calendar-heading.svelte';
import CalendarEventLegend from './calendar-event-legend.svelte';

export const Calendar: {
	Root: typeof CalendarRoot;
	Header: typeof CalendarHeader;
	Grid: typeof CalendarGrid;
	Week: typeof CalendarWeek;
	Prev: typeof CalendarPrev;
	Next: typeof CalendarNext;
	Heading: typeof CalendarHeading;
	EventLegend: typeof CalendarEventLegend;
} = {
	Root: CalendarRoot,
	Header: CalendarHeader,
	Grid: CalendarGrid,
	Week: CalendarWeek,
	Prev: CalendarPrev,
	Next: CalendarNext,
	Heading: CalendarHeading,
	EventLegend: CalendarEventLegend
};
