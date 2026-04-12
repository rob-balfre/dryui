<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
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
	<div role="group" aria-label={monthYearLabel} data-calendar-panel>
		<div class="dp-header" data-calendar-header>
			<Button
				variant="trigger"
				size="icon-sm"
				type="button"
				aria-label="Previous month"
				disabled={ctx.disabled}
				onclick={() => ctx.prevMonth()}
			>
				‹
			</Button>
			<span aria-live="polite" aria-atomic="true" data-calendar-heading>
				{monthYearLabel}
			</span>
			<Button
				variant="trigger"
				size="icon-sm"
				type="button"
				aria-label="Next month"
				disabled={ctx.disabled}
				onclick={() => ctx.nextMonth()}
			>
				›
			</Button>
		</div>

		<div role="grid" aria-label={monthYearLabel}>
			<div role="row" data-calendar-row>
				{#each weekdayLabels as label (label)}
					<div role="columnheader" aria-label={label} data-calendar-columnheader>
						<span aria-hidden="true">{label}</span>
					</div>
				{/each}
			</div>

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
							<Button
								variant="trigger"
								size="icon-sm"
								type="button"
								tabindex={focused ? 0 : -1}
								aria-label={formatDate(day, ctx.locale, {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
								aria-pressed={selected}
								aria-disabled={disabled}
								data-calendar-day={isoStr}
								data-today={today ? '' : undefined}
								data-selected={selected ? '' : undefined}
								data-outside-month={!isCurrent ? '' : undefined}
								{disabled}
								onclick={() => handleDayClick(day)}
								onkeydown={(e) => handleDayKeydown(e, day)}
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
	[data-dp-calendar] {
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

	[data-dp-calendar] [data-calendar-heading] {
		font-size: var(--dry-type-small-size);
		font-weight: 600;
		letter-spacing: -0.01em;
		text-align: center;
	}

	[data-dp-calendar] [role='grid'] {
		display: grid;
		gap: 1px;
	}

	[data-dp-calendar] [data-calendar-row] {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 1px;
	}

	[data-dp-calendar] [data-calendar-columnheader] {
		display: grid;
		place-items: center;
		min-height: var(--dry-space-8);
		font-size: var(--dry-type-tiny-size);
		color: var(--dry-calendar-muted-color, var(--dry-color-text-weak));
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	[data-dp-calendar] [data-calendar-cell] {
		display: grid;
		place-items: center;
	}
</style>
