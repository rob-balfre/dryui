import type { HTMLAttributes } from 'svelte/elements';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

export { default as Skeleton } from '../internal/hidden-div.svelte';
