import type { Snippet } from 'svelte';
import type { ToggleProps as PrimitiveToggleProps } from '@dryui/primitives';
export interface ToggleProps extends PrimitiveToggleProps {
	size?: 'sm' | 'md' | 'lg';
	icon?: Snippet;
}
export { default as Toggle } from './toggle.svelte';
