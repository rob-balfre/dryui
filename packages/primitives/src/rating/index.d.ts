import type { HTMLAttributes } from 'svelte/elements';
export interface RatingProps extends HTMLAttributes<HTMLDivElement> {
	value?: number;
	max?: number;
	disabled?: boolean;
	readonly?: boolean;
	allowHalf?: boolean;
	onValueChange?: (value: number) => void;
}
export { default as Rating } from './rating.svelte';
