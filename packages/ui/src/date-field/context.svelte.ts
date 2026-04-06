import { createContext } from '@dryui/primitives';

export type DateSegmentType = 'month' | 'day' | 'year';

export interface DateFieldContext {
	readonly value: Date | null;
	readonly locale: string;
	readonly min: Date | null;
	readonly max: Date | null;
	readonly disabled: boolean;
	readonly segmentOrder: DateSegmentType[];
	readonly separator: string;
	readonly segments: { type: DateSegmentType; value: number | null }[];
	updateSegment: (type: DateSegmentType, val: number) => void;
	registerSegment: (type: DateSegmentType, el: HTMLElement) => void;
	unregisterSegment: (type: DateSegmentType) => void;
	focusSegment: (type: DateSegmentType, direction: 'next' | 'prev') => void;
}
export const [setDateFieldCtx, getDateFieldCtx] = createContext<DateFieldContext>('date-field');

/**
 * Detect segment order and separator from locale using Intl.DateTimeFormat.
 */
export function getLocaleFormat(locale: string): { order: DateSegmentType[]; separator: string } {
	const formatter = new Intl.DateTimeFormat(locale, {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
	const parts = formatter.formatToParts(new Date(2000, 0, 1));

	const order: DateSegmentType[] = [];
	let separator = '/';

	for (const part of parts) {
		if (part.type === 'month') order.push('month');
		else if (part.type === 'day') order.push('day');
		else if (part.type === 'year') order.push('year');
		else if (part.type === 'literal' && order.length > 0 && order.length < 3) {
			separator = part.value;
		}
	}

	// Fallback if detection fails
	if (order.length !== 3) {
		return { order: ['month', 'day', 'year'], separator: '/' };
	}

	return { order, separator };
}
