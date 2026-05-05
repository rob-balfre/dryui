<script lang="ts">
	import {
		Badge,
		Calendar,
		SegmentedControl,
		type CalendarEvent,
		type CalendarEventCategory,
		type CalendarView
	} from '@dryui/ui';
	import { Briefcase, Car, Hotel, Plane, Train } from 'lucide-svelte';

	const baseYear = 2026;
	const baseMonth = 4;

	function d(day: number, hour = 0, minute = 0): Date {
		return new Date(baseYear, baseMonth, day, hour, minute);
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
	}

	const categories: CalendarEventCategory[] = [
		{ id: 'travel', label: 'Travel', color: '#2563eb', icon: Plane },
		{ id: 'stay', label: 'Stay', color: '#7c3aed', icon: Hotel },
		{ id: 'meeting', label: 'Meeting', color: '#16a34a', icon: Briefcase },
		{ id: 'ground', label: 'Ground', color: '#0f766e', icon: Car },
		{ id: 'rail', label: 'Rail', color: '#0284c7', icon: Train }
	];

	const events: CalendarEvent[] = [
		{
			id: 'flight-out',
			title: 'Flight to New York',
			category: 'travel',
			start: d(18, 8, 15),
			end: d(18, 11, 20),
			location: 'SFO to JFK'
		},
		{
			id: 'hotel',
			title: 'Marriott Marquis',
			category: 'stay',
			start: d(18, 15),
			end: d(22, 11),
			location: 'Times Square'
		},
		{
			id: 'kickoff',
			title: 'Client kickoff',
			category: 'meeting',
			start: d(19, 9),
			end: d(19, 10),
			location: 'TechCorp HQ'
		},
		{
			id: 'briefing',
			title: 'Executive briefing',
			category: 'meeting',
			start: d(20, 9),
			end: d(20, 10, 30),
			location: 'Boardroom 4'
		},
		{
			id: 'train',
			title: 'Acela to Boston',
			category: 'rail',
			start: d(20, 12, 15),
			end: d(20, 13, 45),
			location: 'NYP to BOS'
		},
		{
			id: 'car-return',
			title: 'Return car',
			category: 'ground',
			start: d(21, 17),
			end: d(21, 18),
			location: 'JFK rental center'
		}
	];

	let value = $state<Date | null>(d(20));
	let selectedEvent = $state<CalendarEvent | null>(
		events.find((event) => event.id === 'briefing') ?? null
	);
	let selectedView = $state('week');

	let calendarView: CalendarView = $derived(selectedView === 'month' ? 'month' : 'week');
	let selectedCategory = $derived(
		selectedEvent
			? categories.find((category) => category.id === selectedEvent?.category)
			: undefined
	);
</script>

<div class="calendar-demo">
	<div class="calendar-demo-toolbar">
		<SegmentedControl.Root bind:value={selectedView} aria-label="Calendar view">
			<SegmentedControl.Item value="week">Week</SegmentedControl.Item>
			<SegmentedControl.Item value="month">Month</SegmentedControl.Item>
		</SegmentedControl.Root>

		{#if selectedEvent}
			<Badge variant="soft" color="green">
				{selectedCategory?.label ?? 'Event'} selected
			</Badge>
		{/if}
	</div>

	<Calendar.Root
		bind:value
		bind:selectedEvent
		view={calendarView}
		{events}
		{categories}
		weekStartHour={6}
		weekEndHour={22}
		weekTimeZoneLabel="ET"
	>
		<Calendar.Header>
			<Calendar.Prev />
			<Calendar.Heading />
			<Calendar.Next />
		</Calendar.Header>

		{#if calendarView === 'week'}
			<Calendar.Week />
		{:else}
			<Calendar.Grid {events} eventDisplay="bars" maxEventLanes={2} />
		{/if}

		<Calendar.EventLegend />
	</Calendar.Root>

	{#if selectedEvent}
		<div class="calendar-demo-selection" aria-live="polite">
			<span class="calendar-demo-selection-title">{selectedEvent.title}</span>
			<span class="calendar-demo-selection-meta">
				{formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
				{#if selectedEvent.location}
					<span>at {selectedEvent.location}</span>
				{/if}
			</span>
		</div>
	{/if}
</div>

<style>
	.calendar-demo {
		display: grid;
		gap: var(--dry-space-3);
		max-width: 62rem;
	}

	.calendar-demo-toolbar {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.calendar-demo-selection {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-overlay);
	}

	.calendar-demo-selection-title {
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.calendar-demo-selection-meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
