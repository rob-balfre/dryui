import type { CheckboxProps as PrimitiveCheckboxProps } from '@dryui/primitives';

export interface CheckboxProps extends Omit<PrimitiveCheckboxProps, 'size'> {
	size?: 'sm' | 'md' | 'lg';
}

export { default as Checkbox } from './checkbox.svelte';
