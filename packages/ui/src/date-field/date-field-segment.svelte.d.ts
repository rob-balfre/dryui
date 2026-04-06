import type { HTMLAttributes } from 'svelte/elements';
import type { DateSegmentType } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLSpanElement> {
	type: DateSegmentType;
}
declare const DateFieldSegment: import('svelte').Component<Props, {}, ''>;
type DateFieldSegment = ReturnType<typeof DateFieldSegment>;
export default DateFieldSegment;
