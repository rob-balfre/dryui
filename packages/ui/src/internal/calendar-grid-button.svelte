<script lang="ts" module>
	export interface CalendarGridAdapter {
		readonly viewYear: number;
		readonly viewMonth: number;
		readonly locale: string;
		readonly weekStartDay: number;
		readonly focusedDate: Date;
		readonly min: Date | null;
		readonly max: Date | null;
		readonly disabled: boolean;
		isSelected: (day: Date) => boolean;
		isInRange: (day: Date) => boolean;
		isRangeStart: (day: Date) => boolean;
		isRangeEnd: (day: Date) => boolean;
		selectDate: (day: Date) => void;
		setFocusedDate: (day: Date) => void;
		prevMonth: () => void;
		nextMonth: () => void;
		onEscape?: () => void;
		onHover?: (day: Date | null) => void;
	}
</script>

<script lang="ts">
	import Button from '../button/button.svelte';
	import {
		getCalendarDays,
		isSameDay,
		isToday,
		isDateInRange,
		formatDate
	} from '@dryui/primitives';
	import {
		generateWeekdayLabels,
		splitIntoWeeks,
		getDayISOString,
		handleCalendarKeydown,
		focusCalendarDay
	} from './calendar-grid-utils.js';
	import {
		layoutCalendarEvents,
		type CalendarEventDisplay,
		type CalendarEventGridProps,
		type CalendarEventPiece,
		type CalendarEventRenderContext
	} from './calendar-event-layout.js';

	interface Props extends CalendarEventGridProps {
		adapter: CalendarGridAdapter;
		hideHeader?: boolean;
	}

	let {
		adapter,
		hideHeader = false,
		events = [],
		eventDisplay = 'dots',
		maxEventLanes = 3,
		eventContent,
		class: className,
		...rest
	}: Props = $props();

	const weekdayLabels = $derived(generateWeekdayLabels(adapter.locale, adapter.weekStartDay));
	const calendarDays = $derived(
		getCalendarDays(adapter.viewYear, adapter.viewMonth, adapter.weekStartDay)
	);
	const monthYearLabel = $derived(
		formatDate(new Date(adapter.viewYear, adapter.viewMonth, 1), adapter.locale, {
			month: 'long',
			year: 'numeric'
		})
	);
	const weeks = $derived(splitIntoWeeks(calendarDays));
	const eventLayout = $derived(layoutCalendarEvents({ days: calendarDays, events, maxEventLanes }));

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, adapter.min, adapter.max)) return;
		adapter.selectDate(day);
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, adapter.min, adapter.max)) adapter.selectDate(d);
			},
			onEscape: () => adapter.onEscape?.(),
			setFocusedDate: (d) => adapter.setFocusedDate(d),
			weekStartDay: adapter.weekStartDay,
			min: adapter.min,
			max: adapter.max
		});
		if (result?.type === 'navigate') {
			const container =
				e.currentTarget instanceof HTMLElement
					? (e.currentTarget.closest<HTMLElement>('[data-calendar-grid]') ?? undefined)
					: undefined;
			requestAnimationFrame(() => focusCalendarDay(container, result.newDate));
		}
	}

	function getDayLabel(day: Date, eventSummary: string): string {
		const label = formatDate(day, adapter.locale, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
		return eventSummary ? `${label}, ${eventSummary}` : label;
	}

	function getEventPieces(pieces: Array<CalendarEventPiece | null>): CalendarEventPiece[] {
		return pieces.filter((piece): piece is CalendarEventPiece => piece != null);
	}

	function getEventContext(
		piece: CalendarEventPiece,
		display: CalendarEventDisplay
	): CalendarEventRenderContext {
		return {
			event: piece.event,
			date: piece.date,
			isoDate: piece.isoDate,
			display,
			position: piece.position,
			lane: piece.lane
		};
	}
</script>

<div
	class={className}
	{...rest}
	data-calendar-grid
	data-calendar-grid-headerless={hideHeader ? '' : undefined}
>
	<div role="group" aria-label={monthYearLabel} data-calendar-panel>
		{#if !hideHeader}
			<div data-calendar-header>
				<Button
					variant="trigger"
					size="icon-sm"
					type="button"
					aria-label="Previous month"
					disabled={adapter.disabled}
					onclick={() => adapter.prevMonth()}
				>
					&#8249;
				</Button>
				<span aria-live="polite" aria-atomic="true" data-calendar-heading>
					{monthYearLabel}
				</span>
				<Button
					variant="trigger"
					size="icon-sm"
					type="button"
					aria-label="Next month"
					disabled={adapter.disabled}
					onclick={() => adapter.nextMonth()}
				>
					&#8250;
				</Button>
			</div>
		{/if}

		<div role="grid" aria-label={monthYearLabel}>
			<div role="row" data-calendar-row>
				{#each weekdayLabels as label, i (i)}
					<div role="columnheader" aria-label={label} data-calendar-columnheader>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			{#each weeks as week, weekIndex (weekIndex)}
				<div role="row" data-calendar-row>
					{#each week as day (getDayISOString(day))}
						{@const isCurrent = day.getMonth() === adapter.viewMonth}
						{@const selected = adapter.isSelected(day)}
						{@const today = isToday(day)}
						{@const disabled = !isDateInRange(day, adapter.min, adapter.max)}
						{@const focused = isSameDay(day, adapter.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						{@const inRange = adapter.isInRange(day)}
						{@const rangeStart = adapter.isRangeStart(day)}
						{@const rangeEnd = adapter.isRangeEnd(day)}
						{@const dayEvents = eventLayout.get(isoStr)}
						<div
							role="gridcell"
							data-calendar-cell
							data-selected={selected ? '' : undefined}
							data-today={today ? '' : undefined}
							data-outside-month={!isCurrent ? '' : undefined}
							data-in-range={inRange ? '' : undefined}
							data-range-start={rangeStart ? '' : undefined}
							data-range-end={rangeEnd ? '' : undefined}
							data-has-events={dayEvents && dayEvents.events.length > 0 ? '' : undefined}
						>
							<Button
								variant="trigger"
								size="icon-sm"
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={getDayLabel(day, dayEvents?.summary ?? '')}
								aria-pressed={selected}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								{disabled}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
								onmouseenter={() => adapter.onHover?.(day)}
								onmouseleave={() => adapter.onHover?.(null)}
							>
								{day.getDate()}
							</Button>
							{#if dayEvents && dayEvents.events.length > 0}
								<div
									data-calendar-events
									data-calendar-events-display={eventDisplay}
									aria-hidden="true"
								>
									{#if eventDisplay === 'dots'}
										{#each getEventPieces(dayEvents.piecesByLane) as piece (piece.event.id)}
											<span
												data-calendar-event
												data-calendar-event-kind={piece.event.kind}
												data-calendar-event-tone={piece.event.tone ?? 'neutral'}
												data-calendar-event-position={piece.position}
											>
												{#if eventContent}
													{@render eventContent(getEventContext(piece, eventDisplay))}
												{/if}
											</span>
										{/each}
									{:else}
										{#each dayEvents.piecesByLane as piece, lane (lane)}
											{#if piece}
												<span
													data-calendar-event
													data-calendar-event-kind={piece.event.kind}
													data-calendar-event-tone={piece.event.tone ?? 'neutral'}
													data-calendar-event-position={piece.position}
												>
													{#if eventContent}
														{@render eventContent(getEventContext(piece, eventDisplay))}
													{:else}
														<span data-calendar-event-label>{piece.event.title}</span>
													{/if}
												</span>
											{:else}
												<span data-calendar-event-slot data-calendar-event-empty></span>
											{/if}
										{/each}
									{/if}
									{#if dayEvents.overflowCount > 0}
										<span data-calendar-event-overflow>+{dayEvents.overflowCount}</span>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	[data-calendar-grid] {
		--dry-calendar-event-bg: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
		--dry-calendar-event-color: var(--dry-color-text-brand);
		--dry-calendar-event-radius: var(--dry-radius-sm);
		--dry-calendar-event-size: var(--dry-space-1_5);
		--dry-calendar-event-height: var(--dry-space-4);
		--dry-calendar-event-gap: var(--dry-space-0_5);
		--dry-calendar-event-overflow-color: var(--dry-color-text-weak);

		display: grid;
		gap: var(--dry-space-2);
		user-select: none;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	[data-calendar-grid] [data-calendar-panel] {
		display: grid;
		grid-template-rows: max-content minmax(0, 1fr);
		gap: var(--dry-space-2);
	}

	[data-calendar-grid][data-calendar-grid-headerless] [data-calendar-panel] {
		grid-template-rows: minmax(0, 1fr);
	}

	[data-calendar-grid] [data-calendar-header] {
		display: grid;
		grid-template-columns: auto max-content auto;
		align-items: center;
		align-content: center;
		justify-content: center;
		gap: var(--dry-space-2);
	}

	[data-calendar-grid] [data-calendar-heading] {
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		letter-spacing: 0;
		text-align: center;
	}

	[data-calendar-grid] [data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-7);
		font-size: var(--dry-type-tiny-size);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-calendar-grid] [role='grid'] {
		display: grid;
		gap: 1px;
	}

	[data-calendar-grid] [data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}

	[data-calendar-grid] [data-calendar-cell] {
		display: grid;
		align-content: start;
		justify-items: center;
		gap: var(--dry-calendar-event-gap);
	}

	[data-calendar-grid] [data-calendar-cell][data-in-range] {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent);
	}

	[data-calendar-grid] [data-calendar-cell][data-selected],
	[data-calendar-grid] [data-calendar-cell][data-range-start],
	[data-calendar-grid] [data-calendar-cell][data-range-end] {
		--dry-btn-bg: var(--dry-color-fill-brand);
		--dry-btn-color: var(--dry-color-on-brand);
	}

	[data-calendar-grid] [data-calendar-cell][data-range-start][data-in-range] {
		border-start-start-radius: var(--dry-radius-md);
		border-end-start-radius: var(--dry-radius-md);
	}

	[data-calendar-grid] [data-calendar-cell][data-range-end][data-in-range] {
		border-start-end-radius: var(--dry-radius-md);
		border-end-end-radius: var(--dry-radius-md);
	}

	[data-calendar-grid] [data-calendar-cell][data-today]:not([data-selected]) {
		--dry-btn-color: var(--dry-color-text-brand);
	}

	[data-calendar-grid] [data-calendar-cell][data-outside-month] {
		opacity: 0.4;
	}

	[data-calendar-grid] [data-calendar-events] {
		display: grid;
		justify-self: stretch;
		gap: var(--dry-calendar-event-gap);
		pointer-events: none;
	}

	[data-calendar-grid] [data-calendar-events][data-calendar-events-display='dots'] {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		justify-content: center;
		min-block-size: var(--dry-calendar-event-size);
	}

	[data-calendar-grid] [data-calendar-events][data-calendar-events-display='bars'] {
		grid-auto-rows: var(--dry-calendar-event-height);
	}

	[data-calendar-grid] [data-calendar-event] {
		display: grid;
		align-items: center;
		min-block-size: var(--dry-calendar-event-height);
		padding-inline: var(--dry-space-1);
		overflow: hidden;
		border-radius: var(--dry-calendar-event-radius);
		background: var(--dry-calendar-event-bg);
		color: var(--dry-calendar-event-color);
		font-size: var(--dry-type-tiny-size);
		font-weight: 500;
		line-height: 1;
		white-space: nowrap;
	}

	[data-calendar-grid]
		[data-calendar-events][data-calendar-events-display='dots']
		[data-calendar-event] {
		min-block-size: var(--dry-calendar-event-size);
		block-size: var(--dry-calendar-event-size);
		inline-size: var(--dry-calendar-event-size);
		padding-inline: 0;
		border-radius: var(--dry-radius-full);
	}

	[data-calendar-grid] [data-calendar-event-label] {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	[data-calendar-grid] [data-calendar-event-slot] {
		min-block-size: var(--dry-calendar-event-height);
	}

	[data-calendar-grid] [data-calendar-event-overflow] {
		display: grid;
		place-items: center;
		min-block-size: var(--dry-calendar-event-height);
		color: var(--dry-calendar-event-overflow-color);
		font-size: var(--dry-type-tiny-size);
		font-weight: 500;
		line-height: 1;
	}

	[data-calendar-grid]
		[data-calendar-events][data-calendar-events-display='dots']
		[data-calendar-event-overflow] {
		min-block-size: var(--dry-calendar-event-size);
	}

	[data-calendar-grid] [data-calendar-event-position='start'] {
		border-start-end-radius: 0;
		border-end-end-radius: 0;
	}

	[data-calendar-grid] [data-calendar-event-position='middle'] {
		border-radius: 0;
	}

	[data-calendar-grid] [data-calendar-event-position='end'] {
		border-start-start-radius: 0;
		border-end-start-radius: 0;
	}

	[data-calendar-grid] [data-calendar-event-tone='brand'] {
		--dry-calendar-event-bg: color-mix(in srgb, var(--dry-color-fill-brand) 16%, transparent);
		--dry-calendar-event-color: var(--dry-color-text-brand);
	}

	[data-calendar-grid] [data-calendar-event-tone='info'] {
		--dry-calendar-event-bg: var(--dry-color-fill-info-weak);
		--dry-calendar-event-color: var(--dry-color-text-info);
	}

	[data-calendar-grid] [data-calendar-event-tone='success'] {
		--dry-calendar-event-bg: var(--dry-color-fill-success-weak);
		--dry-calendar-event-color: var(--dry-color-text-success);
	}

	[data-calendar-grid] [data-calendar-event-tone='warning'] {
		--dry-calendar-event-bg: var(--dry-color-fill-warning-weak);
		--dry-calendar-event-color: var(--dry-color-text-warning);
	}

	[data-calendar-grid] [data-calendar-event-tone='danger'] {
		--dry-calendar-event-bg: var(--dry-color-fill-error-weak);
		--dry-calendar-event-color: var(--dry-color-text-error);
	}
</style>
