import type { SliderProps as PrimitiveSliderProps } from '@dryui/primitives';
export interface SliderProps extends Omit<PrimitiveSliderProps, 'size'> {
    size?: 'sm' | 'md' | 'lg';
}
export { default as Slider } from './slider-input.svelte';
