import type { HTMLAttributes } from 'svelte/elements';

export interface ProgressSegment {
	value: number;
	color: string;
	label?: string;
}

export interface ProgressThreshold {
	value: number;
	color?: string;
}

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
	value?: number | undefined;
	max?: number;
	segments?: ProgressSegment[];
	thresholds?: ProgressThreshold[];
	showLabel?: boolean | 'inside' | 'outside';
}

export { default as Progress } from './progress.svelte';
