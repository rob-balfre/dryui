import type { LabelProps as PrimitiveLabelProps } from '@dryui/primitives';
export interface LabelProps extends PrimitiveLabelProps {
	size?: 'sm' | 'md' | 'lg';
}
export { default as Label } from './label.svelte';
