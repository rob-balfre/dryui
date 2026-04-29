<script lang="ts">
	import type { CalendarEventItem } from '@dryui/ui';
	import { Calendar } from '@dryui/ui';

	let selectedDate = $state<Date | null>(new Date(2026, 3, 18));

	const tripEvents: CalendarEventItem[] = [
		{
			id: 'flight-out',
			title: 'SFO -> JFK',
			start: new Date(2026, 3, 18),
			kind: 'flight',
			tone: 'info',
			priority: 20,
			ariaLabel: 'Outbound flight from SFO to JFK'
		},
		{
			id: 'hotel',
			title: 'SoHo hotel',
			start: new Date(2026, 3, 18),
			end: new Date(2026, 3, 21),
			kind: 'hotel',
			tone: 'success',
			priority: 10
		},
		{
			id: 'rental',
			title: 'Rental car',
			start: new Date(2026, 3, 21),
			end: new Date(2026, 3, 24),
			kind: 'rental',
			tone: 'warning'
		}
	];
</script>

<div class="card">
	<div class="heading">
		<p class="eyebrow">Trip calendar</p>
		<p class="title">Upcoming New York itinerary</p>
		<p class="note">
			Travel events stay visual while the calendar remains a date-selection control.
		</p>
	</div>
	<Calendar.Root
		class="trip-calendar"
		bind:value={selectedDate}
		min={new Date(2026, 0, 1)}
		max={new Date(2026, 11, 28)}
	>
		<Calendar.Header>
			<Calendar.Prev />
			<Calendar.Heading />
			<Calendar.Next />
		</Calendar.Header>
		<Calendar.Grid events={tripEvents} eventDisplay="bars" maxEventLanes={3} visibleMonths={2} />
	</Calendar.Root>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.heading {
		display: grid;
		gap: var(--dry-space-1);
	}
	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}
	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	:global(.trip-calendar) {
		justify-self: center;
		inline-size: min(100%, 68rem);
	}

	:global(
		.trip-calendar [data-calendar-grid] [role='grid'] > [data-calendar-row]:not(:first-child)
	) {
		min-block-size: 5.75rem;
	}
</style>
