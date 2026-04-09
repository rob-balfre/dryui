import type { HTMLAttributes } from 'svelte/elements';
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
	variant?: 'text' | 'circular' | 'rectangular';
	width?: string;
	height?: string;
}
export { default as Skeleton } from './skeleton.svelte';
