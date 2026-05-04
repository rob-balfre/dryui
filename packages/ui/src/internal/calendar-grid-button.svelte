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
		focusCalendarDay,
		normalizeVisibleMonths,
		formatVisibleMonthRangeLabel
	} from './calendar-grid-utils.js';
	import {
		layoutCalendarEvents,
		type CalendarEventDisplay,
		type CalendarEventGridProps,
		type CalendarEventPiece,
		type CalendarEventPosition,
		type CalendarEventRenderContext
	} from './calendar-event-layout.js';

	interface Props extends CalendarEventGridProps {
		adapter: CalendarGridAdapter;
		hideHeader?: boolean;
	}

	interface CalendarMonthPanel {
		index: number;
		year: number;
		month: number;
		label: string;
		days: Date[];
		weeks: Date[][];
	}

	interface CalendarEventWeekSegment {
		event: CalendarEventPiece['event'];
		date: Date;
		isoDate: string;
		lane: number;
		startColumn: number;
		span: number;
		position: CalendarEventPosition;
	}

	interface CalendarEventOverflowMarker {
		isoDate: string;
		column: number;
		count: number;
	}

	let {
		adapter,
		hideHeader = false,
		events = [],
		eventDisplay = 'dots',
		maxEventLanes = 3,
		visibleMonths = 1,
		eventContent,
		class: className,
		...rest
	}: Props = $props();

	const weekdayLabels = $derived(generateWeekdayLabels(adapter.locale, adapter.weekStartDay));
	const monthCount = $derived(normalizeVisibleMonths(visibleMonths));
	const monthPanels = $derived.by(() =>
		Array.from({ length: monthCount }, (_, index) => getMonthPanel(index))
	);
	const calendarDays = $derived.by(() =>
		monthPanels.flatMap((panel) =>
			monthCount === 1 ? panel.days : panel.days.filter((day) => isInPanelMonth(day, panel))
		)
	);
	const monthYearLabel = $derived(
		formatVisibleMonthRangeLabel(adapter.viewYear, adapter.viewMonth, adapter.locale, monthCount)
	);
	const eventLayout = $derived(layoutCalendarEvents({ days: calendarDays, events, maxEventLanes }));

	function getMonthPanel(index: number): CalendarMonthPanel {
		const monthDate = new Date(adapter.viewYear, adapter.viewMonth + index, 1);
		const year = monthDate.getFullYear();
		const month = monthDate.getMonth();
		const days = getCalendarDays(year, month, adapter.weekStartDay);

		return {
			index,
			year,
			month,
			label: formatDate(monthDate, adapter.locale, {
				month: 'long',
				year: 'numeric'
			}),
			days,
			weeks: splitIntoWeeks(days)
		};
	}

	function isInPanelMonth(day: Date, panel: CalendarMonthPanel): boolean {
		return day.getFullYear() === panel.year && day.getMonth() === panel.month;
	}

	function isInteractiveDay(day: Date, panel: CalendarMonthPanel): boolean {
		return monthCount === 1 || isInPanelMonth(day, panel);
	}

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

	function getWeekEventSegments(
		week: Date[],
		panel: CalendarMonthPanel
	): CalendarEventWeekSegment[] {
		const segments: CalendarEventWeekSegment[] = [];
		const laneCount = getWeekLaneCount(week);

		for (let lane = 0; lane < laneCount; lane += 1) {
			let segment: CalendarEventWeekSegment | null = null;

			for (let index = 0; index < week.length; index += 1) {
				const day = week[index];
				const piece =
					day && isInteractiveDay(day, panel)
						? eventLayout.get(getDayISOString(day))?.piecesByLane[lane]
						: null;

				if (!piece) {
					if (segment) segments.push(segment);
					segment = null;
					continue;
				}

				if (segment && segment.event.id === piece.event.id) {
					segment.span += 1;
					segment.position = getSegmentPosition(segment.position, piece.position);
					continue;
				}

				if (segment) segments.push(segment);
				segment = {
					event: piece.event,
					date: piece.date,
					isoDate: piece.isoDate,
					lane: piece.lane,
					startColumn: index + 1,
					span: 1,
					position: piece.position
				};
			}

			if (segment) segments.push(segment);
		}

		return segments;
	}

	function getWeekOverflowMarkers(
		week: Date[],
		panel: CalendarMonthPanel
	): CalendarEventOverflowMarker[] {
		const markers: CalendarEventOverflowMarker[] = [];

		for (let index = 0; index < week.length; index += 1) {
			const day = week[index];
			if (!day || !isInteractiveDay(day, panel)) continue;

			const isoDate = getDayISOString(day);
			const count = eventLayout.get(isoDate)?.overflowCount ?? 0;
			if (count <= 0) continue;

			markers.push({
				isoDate,
				column: index + 1,
				count
			});
		}

		return markers;
	}

	function getWeekEventLanes(segments: CalendarEventWeekSegment[]): CalendarEventWeekSegment[][] {
		const lanes: CalendarEventWeekSegment[][] = [];

		for (const segment of segments) {
			lanes[segment.lane] ??= [];
			lanes[segment.lane]?.push(segment);
		}

		for (let index = 0; index < lanes.length; index += 1) {
			lanes[index] ??= [];
		}

		return lanes;
	}

	function getWeekLaneCount(week: Date[]): number {
		return Math.max(
			0,
			...week.map((day) => eventLayout.get(getDayISOString(day))?.piecesByLane.length ?? 0)
		);
	}

	function getSegmentPosition(
		current: CalendarEventPosition,
		next: CalendarEventPosition
	): CalendarEventPosition {
		const starts = current === 'single' || current === 'start';
		const ends = next === 'single' || next === 'end';

		if (starts && ends) return 'single';
		if (starts) return 'start';
		if (ends) return 'end';
		return 'middle';
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

	function getSegmentEventContext(
		segment: CalendarEventWeekSegment,
		display: CalendarEventDisplay
	): CalendarEventRenderContext {
		return {
			event: segment.event,
			date: segment.date,
			isoDate: segment.isoDate,
			display,
			position: segment.position,
			lane: segment.lane
		};
	}
</script>

<div
	class={className}
	{...rest}
	data-calendar-grid
	data-calendar-grid-headerless={hideHeader ? '' : undefined}
	data-visible-months={monthCount}
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

		<div data-calendar-panels>
			{#each monthPanels as panel (`${panel.year}-${panel.month}`)}
				<div role="group" aria-label={panel.label} data-calendar-month-panel>
					<div role="grid" aria-label={panel.label}>
						<div role="row" data-calendar-row>
							{#each weekdayLabels as label, i (i)}
								<div role="columnheader" aria-label={label} data-calendar-columnheader>
									<span aria-hidden="true">{label}</span>
								</div>
							{/each}
						</div>

						{#each panel.weeks as week, weekIndex (weekIndex)}
							{@const eventSegments =
								eventDisplay === 'bars' ? getWeekEventSegments(week, panel) : []}
							{@const eventLanes = getWeekEventLanes(eventSegments)}
							{@const overflowMarkers =
								eventDisplay === 'bars' ? getWeekOverflowMarkers(week, panel) : []}
							<div role="row" data-calendar-row data-calendar-week-row>
								{#each week as day (`${panel.year}-${panel.month}-${getDayISOString(day)}`)}
									{@const isCurrent = isInPanelMonth(day, panel)}
									{@const isInteractive = isInteractiveDay(day, panel)}
									{@const selected = isInteractive && adapter.isSelected(day)}
									{@const today = isToday(day)}
									{@const disabled = !isDateInRange(day, adapter.min, adapter.max)}
									{@const focused = isInteractive && isSameDay(day, adapter.focusedDate)}
									{@const isoStr = getDayISOString(day)}
									{@const inRange = isInteractive && adapter.isInRange(day)}
									{@const rangeStart = isInteractive && adapter.isRangeStart(day)}
									{@const rangeEnd = isInteractive && adapter.isRangeEnd(day)}
									{@const dayEvents = isInteractive ? eventLayout.get(isoStr) : undefined}
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
										{#if isInteractive}
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
										{:else}
											<span data-calendar-day-placeholder aria-hidden="true">{day.getDate()}</span>
										{/if}
										{#if eventDisplay === 'dots' && dayEvents && dayEvents.events.length > 0}
											<div
												data-calendar-events
												data-calendar-events-display={eventDisplay}
												aria-hidden="true"
											>
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
												{#if dayEvents.overflowCount > 0}
													<span data-calendar-event-overflow>+{dayEvents.overflowCount}</span>
												{/if}
											</div>
										{/if}
									</div>
								{/each}
								{#if eventDisplay === 'bars' && (eventLanes.length > 0 || overflowMarkers.length > 0)}
									<div data-calendar-row-events aria-hidden="true">
										{#each eventLanes as laneSegments, lane (lane)}
											<div
												data-calendar-event-lane
												data-calendar-event-lane-empty={laneSegments.length === 0 ? '' : undefined}
											>
												{#each laneSegments as segment (`${segment.event.id}-${segment.isoDate}-${segment.lane}`)}
													<span
														data-calendar-event
														data-calendar-event-segment
														data-calendar-event-id={segment.event.id}
														data-calendar-event-kind={segment.event.kind}
														data-calendar-event-tone={segment.event.tone ?? 'neutral'}
														data-calendar-event-position={segment.position}
														data-calendar-event-column={segment.startColumn}
														data-calendar-event-span={segment.span}
													>
														{#if eventContent}
															{@render eventContent(getSegmentEventContext(segment, eventDisplay))}
														{:else}
															<span data-calendar-event-label>{segment.event.title}</span>
														{/if}
													</span>
												{/each}
											</div>
										{/each}
										{#if overflowMarkers.length > 0}
											<div data-calendar-event-lane>
												{#each overflowMarkers as marker (marker.isoDate)}
													<span
														data-calendar-event-overflow
														data-calendar-event-column={marker.column}
														data-calendar-event-span="1"
													>
														+{marker.count}
													</span>
												{/each}
											</div>
										{/if}
									</div>
								{/if}
							</div>
						{/each}
					</div>
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

		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-2);
		min-inline-size: max-content;
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

	[data-calendar-grid] [data-calendar-panels] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-4);
	}

	[data-calendar-grid][data-visible-months='2'] [data-calendar-panels] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-calendar-grid] [data-calendar-month-panel] {
		display: grid;
		align-content: start;
		gap: var(--dry-space-2);
		min-inline-size: 0;
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
		grid-template-columns: repeat(7, minmax(var(--dry-space-10), 1fr));
	}

	[data-calendar-grid] [data-calendar-row][data-calendar-week-row] {
		row-gap: var(--dry-calendar-event-gap);
	}

	[data-calendar-grid] [data-calendar-cell] {
		display: grid;
		align-content: start;
		justify-items: center;
		gap: var(--dry-calendar-event-gap);
		grid-row: 1;
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

	[data-calendar-grid] [data-calendar-day-placeholder] {
		display: grid;
		place-items: center;
		inline-size: var(--dry-space-10);
		block-size: var(--dry-space-10);
		color: var(--dry-color-text-weak);
		font-size: var(--dry-type-small-size);
		line-height: 1;
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

	[data-calendar-grid] [data-calendar-event] {
		display: grid;
		align-items: center;
		min-block-size: var(--dry-calendar-event-height);
		min-inline-size: 0;
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

	[data-calendar-grid] [data-calendar-row-events] {
		display: grid;
		grid-column: 1 / -1;
		grid-row: 2;
		gap: var(--dry-calendar-event-gap);
		pointer-events: none;
	}

	[data-calendar-grid] [data-calendar-event-lane] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		min-block-size: var(--dry-calendar-event-height);
	}

	[data-calendar-grid] [data-calendar-event-lane] > [data-calendar-event],
	[data-calendar-grid] [data-calendar-event-lane] > [data-calendar-event-overflow] {
		align-self: stretch;
		justify-self: stretch;
		margin-inline: var(--dry-space-0_5);
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

	[data-calendar-grid] [data-calendar-event-overflow] {
		display: grid;
		place-items: center;
		min-block-size: var(--dry-calendar-event-height);
		color: var(--dry-calendar-event-overflow-color);
		font-size: var(--dry-type-tiny-size);
		font-weight: 500;
		line-height: 1;
	}

	[data-calendar-grid] [data-calendar-event-column='1'] {
		grid-column-start: 1;
	}

	[data-calendar-grid] [data-calendar-event-column='2'] {
		grid-column-start: 2;
	}

	[data-calendar-grid] [data-calendar-event-column='3'] {
		grid-column-start: 3;
	}

	[data-calendar-grid] [data-calendar-event-column='4'] {
		grid-column-start: 4;
	}

	[data-calendar-grid] [data-calendar-event-column='5'] {
		grid-column-start: 5;
	}

	[data-calendar-grid] [data-calendar-event-column='6'] {
		grid-column-start: 6;
	}

	[data-calendar-grid] [data-calendar-event-column='7'] {
		grid-column-start: 7;
	}

	[data-calendar-grid] [data-calendar-event-span='1'] {
		grid-column-end: span 1;
	}

	[data-calendar-grid] [data-calendar-event-span='2'] {
		grid-column-end: span 2;
	}

	[data-calendar-grid] [data-calendar-event-span='3'] {
		grid-column-end: span 3;
	}

	[data-calendar-grid] [data-calendar-event-span='4'] {
		grid-column-end: span 4;
	}

	[data-calendar-grid] [data-calendar-event-span='5'] {
		grid-column-end: span 5;
	}

	[data-calendar-grid] [data-calendar-event-span='6'] {
		grid-column-end: span 6;
	}

	[data-calendar-grid] [data-calendar-event-span='7'] {
		grid-column-end: span 7;
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

	@container (max-width: 48rem) {
		[data-calendar-grid][data-visible-months='2'] [data-calendar-panels] {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
