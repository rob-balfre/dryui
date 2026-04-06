import type { HTMLAttributes } from 'svelte/elements';
interface ProgressSegment {
	value: number;
	color: string;
	label?: string;
}
interface ProgressThreshold {
	value: number;
	color?: string;
}
interface Props extends HTMLAttributes<HTMLDivElement> {
	value?: number | undefined;
	max?: number;
	segments?: ProgressSegment[];
	thresholds?: ProgressThreshold[];
	showLabel?: boolean | 'inside' | 'outside';
}
declare const Progress: import('svelte').Component<Props, {}, ''>;
type Progress = ReturnType<typeof Progress>;
export default Progress;
