import { generateFormId, getWeekStartDay } from '@dryui/primitives';
import { SvelteDate } from 'svelte/reactivity';

interface DateViewControllerConfig {
	initialDate?: Date | null;
	locale: () => string;
}

interface DateViewController {
	readonly focusedDate: Date;
	readonly viewMonth: number;
	readonly viewYear: number;
	readonly weekStartDay: number;
	focusDate: (date: Date) => void;
	setFocusedDate: (date: Date) => void;
	goToMonth: (month: number) => void;
	goToYear: (year: number) => void;
	nextMonth: () => void;
	prevMonth: () => void;
}

export function createDateViewController({
	initialDate = null,
	locale
}: DateViewControllerConfig): DateViewController {
	const seedDate = initialDate ? new SvelteDate(initialDate.getTime()) : new SvelteDate();

	let viewMonth = $state(seedDate.getMonth());
	let viewYear = $state(seedDate.getFullYear());
	let focusedTime = $state(seedDate.getTime());

	const weekStartDay = $derived(getWeekStartDay(locale()));

	function updateViewFromDate(date: Date) {
		viewMonth = date.getMonth();
		viewYear = date.getFullYear();
	}

	function goToMonth(month: number) {
		if (month < 0) {
			viewMonth = 11;
			viewYear -= 1;
			return;
		}

		if (month > 11) {
			viewMonth = 0;
			viewYear += 1;
			return;
		}

		viewMonth = month;
	}

	function goToYear(year: number) {
		viewYear = year;
	}

	return {
		get focusedDate() {
			return new SvelteDate(focusedTime);
		},
		get viewMonth() {
			return viewMonth;
		},
		get viewYear() {
			return viewYear;
		},
		get weekStartDay() {
			return weekStartDay;
		},
		focusDate(date: Date) {
			focusedTime = date.getTime();
		},
		setFocusedDate(date: Date) {
			focusedTime = date.getTime();
			updateViewFromDate(date);
		},
		goToMonth,
		goToYear,
		nextMonth() {
			goToMonth(viewMonth + 1);
		},
		prevMonth() {
			goToMonth(viewMonth - 1);
		}
	};
}

interface PickerPopoverControllerConfig {
	triggerIdPrefix: string;
	contentIdPrefix: string;
	open: () => boolean;
	setOpen: (open: boolean) => void;
	disabled: () => boolean;
	onShow?: () => void;
	onClose?: () => void;
}

export interface PickerPopoverController {
	readonly open: boolean;
	readonly triggerId: string;
	readonly contentId: string;
	readonly triggerEl: HTMLElement | null;
	show: () => void;
	close: () => void;
	toggle: () => void;
}

export function createPickerPopoverController({
	triggerIdPrefix,
	contentIdPrefix,
	open,
	setOpen,
	disabled,
	onShow,
	onClose
}: PickerPopoverControllerConfig) {
	const triggerId = generateFormId(triggerIdPrefix);
	const contentId = generateFormId(contentIdPrefix);

	let triggerEl = $state<HTMLElement | null>(null);

	return {
		get triggerId() {
			return triggerId;
		},
		get contentId() {
			return contentId;
		},
		get triggerEl() {
			return triggerEl;
		},
		setTriggerEl(element: HTMLElement | null) {
			triggerEl = element;
		},
		show() {
			if (disabled()) return;

			onShow?.();
			setOpen(true);
		},
		close() {
			setOpen(false);
			onClose?.();
		},
		toggle() {
			if (disabled()) return;

			const nextOpen = !open();

			if (nextOpen) {
				onShow?.();
			}

			setOpen(nextOpen);

			if (!nextOpen) {
				onClose?.();
			}
		}
	};
}
