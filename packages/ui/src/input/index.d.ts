import type { InputProps as PrimitiveInputProps } from '@dryui/primitives';
export interface InputProps extends Omit<PrimitiveInputProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'ghost';
}
export { default as Input } from './input.svelte';
