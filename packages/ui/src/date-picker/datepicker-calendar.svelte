<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDatePickerCtx } from './context.svelte.js';
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
	} from '../internal/calendar-grid-utils.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { class: className, ...rest }: Props = $props();

	const ctx = getDatePickerCtx();

	let containerEl = $state<HTMLDivElement>();

	function bindContainer(node: HTMLDivElement) {
		containerEl = node;

		return () => {
			if (containerEl === node) {
				containerEl = undefined;
			}
		};
	}

	const weekdayLabels = $derived(generateWeekdayLabels(ctx.locale, ctx.weekStartDay));

	const calendarDays = $derived(getCalendarDays(ctx.viewYear, ctx.viewMonth, ctx.weekStartDay));

	const monthYearLabel = $derived(
		formatDate(new Date(ctx.viewYear, ctx.viewMonth, 1), ctx.locale, {
			month: 'long',
			year: 'numeric'
		})
	);

	const weeks = $derived(splitIntoWeeks(calendarDays));

	function handleDayClick(day: Date) {
		if (!isDateInRange(day, ctx.min, ctx.max)) return;
		ctx.select(day);
		ctx.triggerEl?.focus();
	}

	function handleDayKeydown(e: KeyboardEvent, day: Date) {
		const result = handleCalendarKeydown(e, day, {
			onSelect: (d) => {
				if (isDateInRange(d, ctx.min, ctx.max)) {
					ctx.select(d);
					ctx.triggerEl?.focus();
				}
			},
			onEscape: () => {
				ctx.close();
				ctx.triggerEl?.focus();
			},
			setFocusedDate: (d) => ctx.setFocusedDate(d),
			weekStartDay: ctx.weekStartDay,
			min: ctx.min,
			max: ctx.max
		});
		if (result?.type === 'navigate') {
			requestAnimationFrame(() => focusCalendarDay(containerEl, result.newDate));
		}
	}

	function isDayDisabled(day: Date): boolean {
		return !isDateInRange(day, ctx.min, ctx.max);
	}
</script>

<div {@attach bindContainer} class={className} {...rest} data-dp-calendar>
	<!-- Calendar header: month/year + navigation -->
	<div role="group" aria-label={monthYearLabel} data-calendar-panel>
		<div class="dp-header" data-calendar-header>
			<button
				type="button"
				aria-label="Previous month"
				data-calendar-nav
				disabled={ctx.disabled}
				onclick={() => ctx.prevMonth()}
			>
				‹
			</button>
			<span aria-live="polite" aria-atomic="true" data-calendar-heading>
				{monthYearLabel}
			</span>
			<button
				type="button"
				aria-label="Next month"
				data-calendar-nav
				disabled={ctx.disabled}
				onclick={() => ctx.nextMonth()}
			>
				›
			</button>
		</div>

		<!-- Day-of-week header row -->
		<div role="grid" aria-label={monthYearLabel}>
			<div role="row" data-calendar-row>
				{#each weekdayLabels as label (label)}
					<div role="columnheader" aria-label={label} data-calendar-columnheader>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

			<!-- Calendar day grid -->
			{#each weeks as week, weekIndex (weekIndex)}
				<div role="row" data-calendar-row>
					{#each week as day (getDayISOString(day))}
						{@const isCurrent = day.getMonth() === ctx.viewMonth}
						{@const selected = ctx.value ? isSameDay(day, ctx.value) : false}
						{@const today = isToday(day)}
						{@const disabled = isDayDisabled(day)}
						{@const focused = isSameDay(day, ctx.focusedDate)}
						{@const isoStr = getDayISOString(day)}
						<div role="gridcell" data-calendar-cell>
							<button
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-pressed={selected}
								aria-disabled={disabled}
								data-calendar-day-button
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-selected={selected ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								data-disabled={disabled ? '' : undefined}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
							>
								{day.getDate()}
							</button>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	[data-dp-calendar] {
		--dry-calendar-grid-gap: 1px;
		display: grid;
		gap: var(--dry-space-2);
		user-select: none;
		color: var(--dry-calendar-header-color, var(--dry-color-text-strong));
		font-family: var(--dry-font-sans);
	}

	[data-dp-calendar] [data-calendar-panel] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-dp-calendar] [data-calendar-header] {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--dry-space-2);
	}

	[data-dp-calendar] [data-calendar-nav] {
		display: inline-grid;
		place-items: center;
		height: var(--dry-space-8);
		aspect-ratio: 1;
		border: 1px solid transparent;
		border-radius: var(--dry-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-calendar-header-color, var(--dry-color-text-strong));
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			border-color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dp-calendar] [data-calendar-nav]:hover:not([disabled]) {
		background: var(--dry-calendar-day-hover-bg, var(--dry-color-bg-raised));
		border-color: var(--dry-color-stroke-strong);
	}

	[data-dp-calendar] [data-calendar-nav]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-dp-calendar] [data-calendar-heading] {
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	[data-dp-calendar] [role='grid'] {
		display: grid;
		gap: var(--dry-calendar-grid-gap);
	}

	[data-dp-calendar] [data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: var(--dry-calendar-grid-gap);
	}

	[data-dp-calendar] [data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-8);
		font-size: var(--dry-type-tiny-size, var(--dry-type-tiny-size));
		color: var(--dry-calendar-muted-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-dp-calendar] [data-calendar-cell] {
		display: grid;
		grid-template-columns: var(--dry-calendar-day-size, 2.25rem);
		place-items: center;
	}

	[data-dp-calendar] [data-calendar-day-button] {
		display: inline-grid;
		place-items: center;
		min-height: var(--dry-calendar-day-size, 2.25rem);
		aspect-ratio: 1;
		border: none;
		border-radius: var(--dry-calendar-day-radius, var(--dry-radius-md));
		background: transparent;
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-type-small-size, var(--dry-type-small-size));
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		transition:
			background var(--dry-duration-fast) var(--dry-ease-default),
			color var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-dp-calendar] [data-calendar-day-button]:hover:not([data-disabled]) {
		background: var(--dry-calendar-day-hover-bg, var(--dry-color-bg-raised));
	}

	[data-dp-calendar] [data-calendar-day-button]:focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 1px;
	}

	[data-dp-calendar] [data-calendar-day-button][data-today]:not([data-selected]) {
		color: var(--dry-calendar-today-color, var(--dry-color-fill-brand));
		font-weight: 600;
	}

	[data-dp-calendar] [data-calendar-day-button][data-selected] {
		background: var(--dry-calendar-selected-bg, var(--dry-color-fill-brand));
		color: var(--dry-calendar-selected-color, var(--dry-color-on-brand));
		font-weight: 600;
	}

	[data-dp-calendar] [data-calendar-day-button][data-selected]:hover:not([data-disabled]) {
		background: var(--dry-calendar-selected-hover-bg, var(--dry-color-fill-brand-hover));
	}

	[data-dp-calendar] [data-calendar-day-button][data-outside-month] {
		color: var(--dry-calendar-outside-color, var(--dry-color-text-weak));
		opacity: 0.6;
	}

	[data-dp-calendar] [data-calendar-day-button][data-disabled] {
		cursor: not-allowed;
		opacity: 0.4;
		pointer-events: none;
	}
</style>
