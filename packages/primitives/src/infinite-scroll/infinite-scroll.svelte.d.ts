import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
interface Props extends HTMLAttributes<HTMLDivElement> {
	onLoadMore: () => void | Promise<void>;
	hasMore?: boolean | undefined;
	loading?: boolean | undefined;
	rootMargin?: string | undefined;
	children: Snippet;
	loadingIndicator?: Snippet | undefined;
	endMessage?: Snippet | undefined;
}
declare const InfiniteScroll: import('svelte').Component<Props, {}, ''>;
type InfiniteScroll = ReturnType<typeof InfiniteScroll>;
export default InfiniteScroll;
