import type { CalendarEventGridProps } from '../internal/calendar-event-layout.js';

export type { RangeCalendarRootProps } from '@dryui/primitives';

export interface RangeCalendarGridProps extends CalendarEventGridProps {}

import RangeCalendarRoot from './range-calendar-root.svelte';
import RangeCalendarGrid from './range-calendar-grid-button.svelte';

export const RangeCalendar: {
	Root: typeof RangeCalendarRoot;
	Grid: typeof RangeCalendarGrid;
} = {
	Root: RangeCalendarRoot,
	Grid: RangeCalendarGrid
};
