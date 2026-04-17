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
	import type { HTMLAttributes } from 'svelte/elements';
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

	interface Props extends HTMLAttributes<HTMLDivElement> {
		adapter: CalendarGridAdapter;
		hideHeader?: boolean;
	}

	let { adapter, hideHeader = false, class: className, ...rest }: Props = $props();

	let containerEl = $state<HTMLDivElement>();

	function bindContainer(node: HTMLDivElement) {
		containerEl = node;
		return () => {
			if (containerEl === node) containerEl = undefined;
		};
	}

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
			requestAnimationFrame(() => focusCalendarDay(containerEl, result.newDate));
		}
	}
</script>

<div {@attach bindContainer} class={className} {...rest} data-calendar-grid>
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
						<div
							role="gridcell"
							data-calendar-cell
							data-selected={selected ? '' : undefined}
							data-today={today ? '' : undefined}
							data-outside-month={!isCurrent ? '' : undefined}
							data-in-range={inRange ? '' : undefined}
							data-range-start={rangeStart ? '' : undefined}
							data-range-end={rangeEnd ? '' : undefined}
						>
							<Button
								variant="trigger"
								size="icon-sm"
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, adapter.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
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
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	[data-calendar-grid] {
		display: grid;
		gap: var(--dry-space-2);
		user-select: none;
		color: var(--dry-color-text-strong);
		font-family: var(--dry-font-sans);
	}

	[data-calendar-grid] [data-calendar-panel] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-calendar-grid] [data-calendar-header] {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-calendar-grid] [data-calendar-heading] {
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		letter-spacing: -0.01em;
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
		place-items: center;
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
</style>
