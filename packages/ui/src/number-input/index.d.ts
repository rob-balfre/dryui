import type { NumberInputProps as PrimitiveNumberInputProps } from '@dryui/primitives';
export interface NumberInputProps extends Omit<PrimitiveNumberInputProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
}
export { default as NumberInput } from './number-input.svelte';
