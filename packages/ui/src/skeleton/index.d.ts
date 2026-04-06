import type { SkeletonProps as PrimitiveSkeletonProps } from '@dryui/primitives';
export interface SkeletonProps extends PrimitiveSkeletonProps {
	variant?: 'text' | 'circular' | 'rectangular';
	width?: string;
	height?: string;
}
export { default as Skeleton } from './skeleton.svelte';
