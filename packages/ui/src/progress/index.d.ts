import type { ProgressProps as PrimitiveProgressProps, ProgressSegment, ProgressThreshold } from '@dryui/primitives';
export type { ProgressSegment, ProgressThreshold };
export interface ProgressProps extends PrimitiveProgressProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'blue' | 'green' | 'red' | 'yellow';
}
export { default as Progress } from './progress.svelte';
