<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Spinner } from '../spinner/index.js';

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
		children: childSnippet,
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

{#snippet defaultLoadingIndicator()}
	<div data-is-indicator>
		<Spinner size="sm" color="current" label="Loading more..." />
	</div>
{/snippet}

{#snippet defaultEndMessage()}
	<div data-is-end-message>No more items</div>
{/snippet}

<div class={className} data-infinite-scroll {...rest}>
	{@render childSnippet()}
	{#if hasMore}
		<div bind:this={sentinel} aria-hidden="true" data-is-sentinel></div>
		{#if loading}
			{#if loadingIndicator}
				{@render loadingIndicator()}
			{:else}
				{@render defaultLoadingIndicator()}
			{/if}
		{/if}
	{:else if endMessage}
		{@render endMessage()}
	{:else}
		{@render defaultEndMessage()}
	{/if}
</div>

<style>
	[data-infinite-scroll] {
		/* Component tokens (Tier 3) */
		--dry-infinite-scroll-indicator-padding: var(--dry-space-6);
		--dry-infinite-scroll-indicator-color: var(--dry-color-text-weak, inherit);
		--dry-infinite-scroll-end-padding: var(--dry-space-6);
		--dry-infinite-scroll-end-color: var(--dry-color-text-weak, inherit);
		--dry-infinite-scroll-end-font-size: var(
			--dry-type-small-size,
			var(--dry-text-sm-size),
			0.875rem
		);
	}

	[data-is-sentinel] {
		height: 1px;
	}

	[data-is-indicator] {
		display: grid;
		place-items: center;
		padding: var(--dry-infinite-scroll-indicator-padding);
		color: var(--dry-infinite-scroll-indicator-color);
	}

	[data-is-end-message] {
		display: grid;
		place-items: center;
		padding: var(--dry-infinite-scroll-end-padding);
		color: var(--dry-infinite-scroll-end-color);
		font-size: var(--dry-infinite-scroll-end-font-size);
		font-family: var(--dry-font-sans, sans-serif);
	}
</style>
