import type { RatingProps as PrimitiveRatingProps } from '@dryui/primitives';

export interface RatingProps extends PrimitiveRatingProps {
	size?: 'sm' | 'md' | 'lg';
}

export { default as Rating } from './rating.svelte';
