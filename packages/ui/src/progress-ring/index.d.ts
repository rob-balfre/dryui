import type { ProgressRingProps as PrimitiveProgressRingProps } from '@dryui/primitives';
export interface ProgressRingProps extends PrimitiveProgressRingProps {
	color?: 'primary' | 'gray' | 'green' | 'red' | 'yellow';
	indeterminate?: boolean;
}
export { default as ProgressRing } from './progress-ring.svelte';
