import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

export interface CalendarRootProps extends HTMLAttributes<HTMLDivElement> {
	value?: Date | null;
	locale?: string;
	min?: Date | null;
	max?: Date | null;
	disabled?: boolean;
	children: Snippet;
}

export interface CalendarHeaderProps extends HTMLAttributes<HTMLDivElement> {
	children?: Snippet;
}

export interface CalendarGridProps extends HTMLAttributes<HTMLDivElement> {}

export interface CalendarPrevProps extends HTMLButtonAttributes {
	children?: Snippet;
}

export interface CalendarNextProps extends HTMLButtonAttributes {
	children?: Snippet;
}

export interface CalendarHeadingProps extends HTMLAttributes<HTMLSpanElement> {}

export { default as CalendarRoot } from './calendar-root.svelte';
export { default as CalendarHeader } from './calendar-header.svelte';
export { default as CalendarGrid } from './calendar-grid.svelte';
export { default as CalendarPrev } from './calendar-prev.svelte';
export { default as CalendarNext } from './calendar-next.svelte';
export { default as CalendarHeading } from './calendar-heading.svelte';

import CalendarRoot from './calendar-root.svelte';
import CalendarHeader from './calendar-header.svelte';
import CalendarGrid from './calendar-grid.svelte';
import CalendarPrev from './calendar-prev.svelte';
import CalendarNext from './calendar-next.svelte';
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
