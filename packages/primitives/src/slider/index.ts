import type { HTMLInputAttributes } from 'svelte/elements';

export interface SliderProps extends HTMLInputAttributes {
	value?: number;
	min?: number;
	max?: number;
	step?: number;
	disabled?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

export { default as Slider } from './slider.svelte';
