import type { HTMLAttributes } from 'svelte/elements';
import type { ProgressSegment, ProgressThreshold } from '@dryui/primitives';
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: number;
	max?: number;
	size?: 'sm' | 'md' | 'lg';
	color?: 'blue' | 'green' | 'red' | 'yellow';
	segments?: ProgressSegment[];
	thresholds?: ProgressThreshold[];
	showLabel?: boolean | 'inside' | 'outside';
}
declare const Progress: import('svelte').Component<Props, {}, ''>;
type Progress = ReturnType<typeof Progress>;
export default Progress;
