import type { Snippet } from 'svelte';
import type { SliderProps as PrimitiveSliderProps } from '@dryui/primitives';

export type SliderVariant = 'default' | 'pill';

export interface SliderProps extends Omit<PrimitiveSliderProps, 'size'> {
	size?: 'sm' | 'md' | 'lg';
	variant?: SliderVariant;
	valueLabel?: Snippet<[{ value: number; percentage: number }]>;
}

export { default as Slider } from './slider-input.svelte';
