<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { CalendarEvent, CalendarEventCategory } from './types.js';

	export interface CalendarWeekProps extends HTMLAttributes<HTMLDivElement> {
		event?: Snippet<[{ event: CalendarEvent; category: CalendarEventCategory | undefined }]>;
	}
</script>

<script lang="ts">
	import { isSameDay, isToday, formatDate } from '@dryui/primitives';
	import { getCalendarCtx } from './context.svelte.js';
	import { getWeekDays, layoutWeekEvents, formatHourLabel, formatTime } from './week-utils.js';
	import Button from '../button/button.svelte';

	let { event: eventSnippet, class: className, ...rest }: CalendarWeekProps = $props();

	const ctx = getCalendarCtx();

	function normalizeStartHour(hour: number): number {
		return Math.min(23, Math.max(0, Math.floor(hour)));
	}

	function normalizeEndHour(hour: number, startHour: number): number {
		return Math.min(24, Math.max(startHour + 1, Math.floor(hour)));
	}

	const weekDays = $derived(getWeekDays(ctx.focusedDate, ctx.weekStartDay));
	const startHour = $derived(normalizeStartHour(ctx.weekStartHour));
	const endHour = $derived(normalizeEndHour(ctx.weekEndHour, startHour));
	const hours = $derived(Array.from({ length: endHour - startHour }, (_, i) => startHour + i));
	const layout = $derived(layoutWeekEvents(ctx.events, weekDays, startHour, endHour));
	const bandRowCount = $derived(
		layout.band.length === 0 ? 0 : Math.max(...layout.band.map((b) => b.row)) + 1
	);

	function selectEvent(e: CalendarEvent) {
		ctx.selectEvent(e);
	}

	function createStyle(properties: Record<string, string | number>): string {
		return Object.entries(properties)
			.map(([property, value]) => `${property}: ${value};`)
			.join(' ');
	}
</script>

<div data-calendar-week class={className} {...rest}>
	<div data-calendar-week-header>
		<div data-calendar-week-time-spacer aria-hidden="true">
			{#if ctx.weekTimeZoneLabel}
				<span data-calendar-week-tz>{ctx.weekTimeZoneLabel}</span>
			{/if}
		</div>
		{#each weekDays as day, i (i)}
			{@const today = isToday(day)}
			<div
				data-calendar-week-day-head
				data-today={today ? '' : undefined}
				role="columnheader"
				aria-label={formatDate(day, ctx.locale, {
					weekday: 'long',
					month: 'long',
					day: 'numeric'
				})}
			>
				<span data-calendar-week-weekday>
					{formatDate(day, ctx.locale, { weekday: 'short' })}
				</span>
				<span data-calendar-week-daynum>
					<span data-calendar-week-day-month>
						{formatDate(day, ctx.locale, { month: 'short' })}
					</span>
					<span data-calendar-week-day-num data-today={today ? '' : undefined}>
						{day.getDate()}
					</span>
				</span>
			</div>
		{/each}
	</div>

	{#if bandRowCount > 0}
		<div data-calendar-week-band style={createStyle({ '--dry-calendar-band-rows': bandRowCount })}>
			<div data-calendar-week-band-label aria-hidden="true">all-day</div>
			<div data-calendar-week-band-grid>
				{#each weekDays as day, i (i)}
					<div data-calendar-week-band-cell data-today={isToday(day) ? '' : undefined}></div>
				{/each}
				{#each layout.band as bandEvent (bandEvent.event.id)}
					{@const category = ctx.getCategory(bandEvent.event.category)}
					{@const selected = ctx.selectedEvent?.id === bandEvent.event.id}
					{@const color = category?.color ?? 'var(--dry-color-fill-brand)'}
					<div
						data-calendar-week-band-event
						data-category={bandEvent.event.category ?? undefined}
						data-selected={selected ? '' : undefined}
						style={createStyle({
							'--dry-calendar-band-color': color,
							'grid-column': `${bandEvent.startDayIndex + 1} / ${bandEvent.endDayIndex + 2}`,
							'grid-row': bandEvent.row + 1
						})}
					>
						<Button
							variant="bare"
							data-calendar-week-band-button
							aria-pressed={selected}
							onclick={() => selectEvent(bandEvent.event)}
						>
							{#if eventSnippet}
								{@render eventSnippet({ event: bandEvent.event, category })}
							{:else}
								<span data-calendar-week-band-content>
									<span data-calendar-week-band-title>{bandEvent.event.title}</span>
									{#if bandEvent.event.location}
										<span data-calendar-week-band-meta>{bandEvent.event.location}</span>
									{/if}
								</span>
							{/if}
						</Button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div data-calendar-week-grid role="grid" aria-label="Week schedule">
		<div data-calendar-week-time-axis aria-hidden="true">
			{#each hours as hour (hour)}
				<div data-calendar-week-time-cell>
					<span>{formatHourLabel(hour, ctx.locale)}</span>
				</div>
			{/each}
		</div>

		{#each weekDays as day, dayIndex (dayIndex)}
			{@const today = isToday(day)}
			{@const isFocused = isSameDay(day, ctx.focusedDate)}
			<div
				data-calendar-week-day-col
				data-today={today ? '' : undefined}
				data-focused={isFocused ? '' : undefined}
				role="gridcell"
			>
				{#each hours as hour (hour)}
					<div data-calendar-week-hour-cell></div>
				{/each}

				{#each layout.positioned.filter((p) => p.dayIndex === dayIndex) as positioned (positioned.event.id)}
					{@const category = ctx.getCategory(positioned.event.category)}
					{@const selected = ctx.selectedEvent?.id === positioned.event.id}
					{@const widthPct = 100 / positioned.columnCount}
					{@const leftPct = widthPct * positioned.column}
					{@const rightPct = 100 - leftPct - widthPct}
					{@const rangeMinutes = Math.max(1, (endHour - startHour) * 60)}
					{@const topPct = ((positioned.startMinutes - startHour * 60) / rangeMinutes) * 100}
					{@const heightPct =
						((positioned.endMinutes - positioned.startMinutes) / rangeMinutes) * 100}
					{@const color = category?.color ?? 'var(--dry-color-fill-brand)'}
					<div
						data-calendar-week-event
						data-category={positioned.event.category ?? undefined}
						data-selected={selected ? '' : undefined}
						style={createStyle({
							'--dry-calendar-event-color': color,
							'--dry-calendar-event-top': `${topPct}%`,
							'--dry-calendar-event-height': `${heightPct}%`,
							'--dry-calendar-event-start': `${leftPct}%`,
							'--dry-calendar-event-end': `${rightPct}%`
						})}
					>
						<Button
							variant="bare"
							data-calendar-week-event-button
							aria-pressed={selected}
							aria-label="{positioned.event.title} {formatTime(
								positioned.event.start,
								ctx.locale
							)} to {formatTime(positioned.event.end, ctx.locale)}"
							onclick={() => selectEvent(positioned.event)}
						>
							{#if eventSnippet}
								{@render eventSnippet({ event: positioned.event, category })}
							{:else}
								<span data-calendar-week-event-content>
									<span data-calendar-week-event-title>
										{#if category?.icon}
											{@const Icon = category.icon}
											<Icon size={12} aria-hidden="true" />
										{/if}
										<span>{positioned.event.title}</span>
									</span>
									<span data-calendar-week-event-time>
										{formatTime(positioned.event.start, ctx.locale)} – {formatTime(
											positioned.event.end,
											ctx.locale
										)}
									</span>
									{#if positioned.event.location}
										<span data-calendar-week-event-meta>{positioned.event.location}</span>
									{/if}
									{#if positioned.event.description}
										<span data-calendar-week-event-meta>{positioned.event.description}</span>
									{/if}
								</span>
							{/if}
						</Button>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	[data-calendar-week] {
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: 0;
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-strong);
		min-height: 32rem;
	}

	[data-calendar-week-header] {
		display: grid;
		grid-template-columns: var(--dry-calendar-week-time-col) repeat(7, minmax(0, 1fr));
		border-bottom: 1px solid var(--dry-calendar-week-grid-color);
	}

	[data-calendar-week-time-spacer] {
		display: grid;
		place-items: center;
		padding: var(--dry-space-2);
	}

	[data-calendar-week-tz] {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	[data-calendar-week-day-head] {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-2) var(--dry-space-3);
		border-left: 1px solid var(--dry-calendar-week-grid-color);
		text-align: left;
	}

	[data-calendar-week-weekday] {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	[data-calendar-week-daynum] {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: var(--dry-space-2);
		font-size: var(--dry-text-base-size);
		color: var(--dry-color-text-strong);
	}

	[data-calendar-week-day-month] {
		color: var(--dry-color-text-weak);
		font-size: var(--dry-text-sm-size);
	}

	[data-calendar-week-day-num] {
		display: inline-grid;
		place-items: center;
		font-weight: 600;
	}

	[data-calendar-week-day-num][data-today] {
		aspect-ratio: 1;
		min-height: 1.75rem;
		padding: 0 0.4rem;
		border-radius: 999px;
		background: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand);
	}

	[data-calendar-week-band] {
		display: grid;
		grid-template-columns: var(--dry-calendar-week-time-col) 1fr;
		border-bottom: 1px solid var(--dry-calendar-week-grid-color);
	}

	[data-calendar-week-band-label] {
		display: grid;
		place-items: end center;
		padding: var(--dry-space-2);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	[data-calendar-week-band-grid] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		grid-template-rows: repeat(var(--dry-calendar-band-rows, 1), minmax(2.5rem, auto));
		gap: var(--dry-space-1);
		padding: var(--dry-space-1);
		position: relative;
	}

	[data-calendar-week-band-cell] {
		grid-row: 1 / -1;
		border-left: 1px solid var(--dry-calendar-week-grid-color);
	}

	[data-calendar-week-band-cell]:first-child {
		border-left: none;
	}

	[data-calendar-week-band-event] {
		display: grid;
		min-height: 2.5rem;
		border: 1px solid color-mix(in srgb, var(--dry-calendar-band-color) 35%, transparent);
		border-left: 3px solid var(--dry-calendar-band-color);
		border-radius: var(--dry-calendar-event-radius);
		background: color-mix(in srgb, var(--dry-calendar-band-color) 16%, var(--dry-color-bg-overlay));
		text-align: left;
		align-self: stretch;
		overflow: hidden;
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--dry-color-text-strong);
		--dry-btn-padding-x: var(--dry-space-2);
		--dry-btn-padding-y: var(--dry-space-1);
		--dry-btn-radius: 0;
		--dry-btn-justify: stretch;
		--dry-btn-align: stretch;
		--dry-btn-min-height: 0;
	}

	[data-calendar-week-band-event]:hover {
		background: color-mix(in srgb, var(--dry-calendar-band-color) 24%, var(--dry-color-bg-overlay));
	}

	[data-calendar-week-band-event][data-selected] {
		outline: 2px solid var(--dry-calendar-band-color);
		outline-offset: 1px;
	}

	[data-calendar-week-band-content] {
		display: grid;
		gap: 2px;
	}

	[data-calendar-week-band-title] {
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		line-height: 1.2;
	}

	[data-calendar-week-band-meta] {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.3;
	}

	[data-calendar-week-grid] {
		display: grid;
		grid-template-columns: var(--dry-calendar-week-time-col) repeat(7, minmax(0, 1fr));
		position: relative;
	}

	[data-calendar-week-time-axis] {
		display: grid;
		grid-auto-rows: minmax(var(--dry-calendar-week-row-height), 1fr);
	}

	[data-calendar-week-time-cell] {
		position: relative;
		border-top: 1px solid var(--dry-calendar-week-grid-color);
		padding: var(--dry-space-1) var(--dry-space-2);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		min-height: var(--dry-calendar-week-row-height);
	}

	[data-calendar-week-time-cell]:first-child {
		border-top: none;
	}

	[data-calendar-week-time-cell] span {
		position: relative;
		top: -0.4rem;
	}

	[data-calendar-week-day-col] {
		position: relative;
		display: grid;
		grid-auto-rows: minmax(var(--dry-calendar-week-row-height), 1fr);
		border-left: 1px solid var(--dry-calendar-week-grid-color);
	}

	[data-calendar-week-hour-cell] {
		border-top: 1px solid var(--dry-calendar-week-grid-color);
	}

	[data-calendar-week-hour-cell]:first-child {
		border-top: none;
	}

	[data-calendar-week-day-col][data-today] {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 4%, transparent);
	}

	[data-calendar-week-event] {
		position: absolute;
		display: grid;
		top: var(--dry-calendar-event-top);
		height: var(--dry-calendar-event-height);
		inset-inline-start: calc(var(--dry-calendar-event-start) + 2px);
		inset-inline-end: calc(var(--dry-calendar-event-end) + 2px);
		border: 1px solid color-mix(in srgb, var(--dry-calendar-event-color) 35%, transparent);
		border-left: 3px solid var(--dry-calendar-event-color);
		border-radius: var(--dry-calendar-event-radius);
		background: color-mix(
			in srgb,
			var(--dry-calendar-event-color) 16%,
			var(--dry-color-bg-overlay)
		);
		overflow: hidden;
		text-align: left;
		z-index: 1;
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--dry-color-text-strong);
		--dry-btn-padding-x: var(--dry-space-2);
		--dry-btn-padding-y: var(--dry-space-1);
		--dry-btn-radius: 0;
		--dry-btn-justify: start;
		--dry-btn-align: start;
		--dry-btn-min-height: 0;
	}

	[data-calendar-week-event]:hover {
		background: color-mix(
			in srgb,
			var(--dry-calendar-event-color) 26%,
			var(--dry-color-bg-overlay)
		);
		z-index: 2;
	}

	[data-calendar-week-event][data-selected] {
		outline: 2px solid var(--dry-calendar-event-color);
		outline-offset: 1px;
		z-index: 2;
	}

	[data-calendar-week-event-content] {
		display: grid;
		gap: 2px;
	}

	[data-calendar-week-event-title] {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: 4px;
		align-items: center;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		line-height: 1.2;
		color: var(--dry-color-text-strong);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	[data-calendar-week-event-time] {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.3;
	}

	[data-calendar-week-event-meta] {
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.3;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
