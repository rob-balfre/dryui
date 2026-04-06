<script lang="ts">
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

	let {
		onLoadMore,
		hasMore = true,
		loading = false,
		rootMargin = '200px',
		children,
		loadingIndicator,
		endMessage,
		class: className,
		...rest
	}: Props = $props();

	let sentinel: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		if (!sentinel || !hasMore || loading) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasMore && !loading) {
					onLoadMore();
				}
			},
			{ rootMargin }
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	});
</script>

<div class={className} {...rest}>
	{@render children()}
	{#if hasMore}
		<div bind:this={sentinel} aria-hidden="true" class="sentinel"></div>
		{#if loading && loadingIndicator}
			{@render loadingIndicator()}
		{/if}
	{:else if endMessage}
		{@render endMessage()}
	{/if}
</div>

<style>
	.sentinel {
		height: 1px;
	}
</style>
