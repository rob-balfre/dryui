import type { Component, ComponentType, SvelteComponent } from 'svelte';
import type { CalendarEventItem } from '../internal/calendar-event-layout.js';

export type CalendarView = 'month' | 'week';
export type CalendarEventCategoryIcon =
	| Component<Record<string, unknown>>
	| ComponentType<SvelteComponent<any>>;

export interface CalendarEvent extends CalendarEventItem {
	end: Date;
	category?: string;
	description?: string;
	location?: string;
	allDay?: boolean;
	meta?: Record<string, string>;
}

export interface CalendarEventCategory {
	id: string;
	label: string;
	color: string;
	icon?: CalendarEventCategoryIcon;
}

export interface PositionedEvent {
	event: CalendarEvent;
	dayIndex: number;
	startMinutes: number;
	endMinutes: number;
	column: number;
	columnCount: number;
}

export interface DayBandEvent {
	event: CalendarEvent;
	startDayIndex: number;
	endDayIndex: number;
	row: number;
}
