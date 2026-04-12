export interface AlphaSliderProps {
    value?: number;
    color?: string;
    min?: number;
    max?: number;
    step?: number;
    onchange?: (value: number) => void;
}
export { default as AlphaSlider } from './alpha-slider-input.svelte';
