import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
export interface InfiniteScrollProps extends HTMLAttributes<HTMLDivElement> {
    onLoadMore: () => void | Promise<void>;
    hasMore?: boolean;
    loading?: boolean;
    rootMargin?: string;
    children: Snippet;
    loadingIndicator?: Snippet;
    endMessage?: Snippet;
}
export { default as InfiniteScroll } from './infinite-scroll.svelte';
