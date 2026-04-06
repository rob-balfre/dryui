/**
 * Re-export from shared date utilities.
 * Kept for backward compatibility — new code should import from '../utils/date-utils.js'.
 */
export {
	getDaysInMonth,
	getFirstDayOfMonth,
	getWeekStartDay,
	isSameDay,
	isToday,
	isDateInRange,
	formatDate,
	getCalendarDays,
	addMonths,
	addYears
} from '../utils/date-utils.js';
