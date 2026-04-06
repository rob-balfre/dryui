import type { HTMLAttributes } from 'svelte/elements';

export interface StarRatingRootProps extends HTMLAttributes<HTMLDivElement> {
	stars: number;
	label?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: 'filled' | 'outlined';
}

import StarRatingRoot from './star-rating-root.svelte';

export const StarRating: {
	Root: typeof StarRatingRoot;
} = {
	Root: StarRatingRoot
};
