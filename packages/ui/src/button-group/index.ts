import type { ButtonGroupProps as PrimitiveButtonGroupProps } from '@dryui/primitives';

export interface ButtonGroupProps extends PrimitiveButtonGroupProps {
	size?: 'sm' | 'md' | 'lg';
}

export { default as ButtonGroup } from './button-group.svelte';
