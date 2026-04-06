import type { DateFieldRootProps as PrimitiveDateFieldRootProps } from '@dryui/primitives';

export type { DateSegmentType } from '@dryui/primitives';

export type { DateFieldSegmentProps, DateFieldSeparatorProps } from '@dryui/primitives';

export interface DateFieldRootProps extends PrimitiveDateFieldRootProps {
	size?: 'sm' | 'md' | 'lg';
}

import DateFieldRoot from './date-field-root.svelte';
import DateFieldSegment from './date-field-segment.svelte';
import DateFieldSeparator from './date-field-separator.svelte';

export const DateField: {
	Root: typeof DateFieldRoot;
	Segment: typeof DateFieldSegment;
	Separator: typeof DateFieldSeparator;
} = {
	Root: DateFieldRoot,
	Segment: DateFieldSegment,
	Separator: DateFieldSeparator
};
