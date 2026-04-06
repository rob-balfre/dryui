import type { SpinnerProps as PrimitiveSpinnerProps } from '@dryui/primitives';
export interface SpinnerProps extends PrimitiveSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	color?: 'primary' | 'current';
}
export { default as Spinner } from './spinner.svelte';
