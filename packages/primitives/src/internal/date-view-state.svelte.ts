import { addMonths, getWeekStartDay } from '../utils/date-utils.js';
import { SvelteDate } from 'svelte/reactivity';

interface DateViewStateOptions {
	getLocale: () => string;
	getInitialDate: () => Date | null | undefined;
}

interface DateViewStateController {
	readonly weekStartDay: number;
	readonly viewMonth: number;
	readonly viewYear: number;
	readonly focusedDate: Date;
	goToMonth: (month: number) => void;
	goToYear: (year: number) => void;
	nextMonth: () => void;
	prevMonth: () => void;
	setFocusedDate: (date: Date) => void;
}

export function createDateViewState(options: DateViewStateOptions): DateViewStateController {
	const initialDate = options.getInitialDate();
	const seedDate = initialDate ? new SvelteDate(initialDate.getTime()) : new SvelteDate();

	const weekStartDay = $derived(getWeekStartDay(options.getLocale()));
	let viewMonth = $state(seedDate.getMonth());
	let viewYear = $state(seedDate.getFullYear());
	let focusedTime = $state(seedDate.getTime());

	function setFocusedDate(date: Date) {
		focusedTime = date.getTime();
		viewMonth = date.getMonth();
		viewYear = date.getFullYear();
	}

	function goToMonth(month: number) {
		if (month < 0) {
			viewMonth = 11;
			viewYear = viewYear - 1;
		} else if (month > 11) {
			viewMonth = 0;
			viewYear = viewYear + 1;
		} else {
			viewMonth = month;
		}
	}

	function goToYear(year: number) {
		viewYear = year;
	}

	function nextMonth() {
		const next = addMonths(new SvelteDate(viewYear, viewMonth, 1), 1);
		viewMonth = next.getMonth();
		viewYear = next.getFullYear();
	}

	function prevMonth() {
		const prev = addMonths(new SvelteDate(viewYear, viewMonth, 1), -1);
		viewMonth = prev.getMonth();
		viewYear = prev.getFullYear();
	}

	return {
		get weekStartDay() {
			return weekStartDay;
		},
		get viewMonth() {
			return viewMonth;
		},
		get viewYear() {
			return viewYear;
		},
		get focusedDate() {
			return new SvelteDate(focusedTime);
		},
		goToMonth,
		goToYear,
		nextMonth,
		prevMonth,
		setFocusedDate
	};
}
