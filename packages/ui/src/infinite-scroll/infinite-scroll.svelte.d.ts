import type { HTMLAttributes } from 'svelte/elements';
import { type InfiniteScrollProps as InfiniteScrollPrimitiveProps } from '@dryui/primitives/infinite-scroll';
interface Props extends HTMLAttributes<HTMLDivElement> {
	onLoadMore: InfiniteScrollPrimitiveProps['onLoadMore'];
	hasMore?: InfiniteScrollPrimitiveProps['hasMore'];
	loading?: InfiniteScrollPrimitiveProps['loading'];
	rootMargin?: InfiniteScrollPrimitiveProps['rootMargin'];
	children: InfiniteScrollPrimitiveProps['children'];
	loadingIndicator?: InfiniteScrollPrimitiveProps['loadingIndicator'];
	endMessage?: InfiniteScrollPrimitiveProps['endMessage'];
}
declare const InfiniteScroll: import('svelte').Component<Props, {}, ''>;
type InfiniteScroll = ReturnType<typeof InfiniteScroll>;
export default InfiniteScroll;
