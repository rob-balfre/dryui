<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		fallback?: string;
		fallbackSnippet?: Snippet;
	}

	let {
		fallback,
		fallbackSnippet,
		src,
		alt = '',
		loading = 'lazy',
		class: className,
		...rest
	}: Props = $props();

	let status = $state<'loading' | 'loaded' | 'error'>('loading');

	function handleLoad() {
		status = 'loaded';
	}

	function handleError() {
		status = 'error';
	}

	$effect.pre(() => {
		if (src) {
			status = 'loading';
		}
	});
</script>

{#if status === 'error' && fallbackSnippet}
	{@render fallbackSnippet()}
{:else if status === 'error' && fallback}
	<!-- dryui-allow raw-img: Image is the canonical component that renders the underlying img element. -->
	<img class={className} src={fallback} {alt} data-state="fallback" {...rest} />
{:else}
	<!-- dryui-allow raw-img: Image is the canonical component that renders the underlying img element. -->
	<img
		class={className}
		{src}
		{alt}
		{loading}
		data-state={status}
		onload={handleLoad}
		onerror={handleError}
		{...rest}
	/>
{/if}

<style>
	img {
		--dry-image-radius: var(--dry-radius-lg);
		--dry-image-bg: var(--dry-color-bg-overlay);
		--dry-image-object-fit: cover;
		--dry-image-block-size: auto;
		--dry-image-place-self: auto;

		display: block;
		block-size: var(--dry-image-block-size);
		place-self: var(--dry-image-place-self);
		border-radius: var(--dry-image-radius);
		background: var(--dry-image-bg);
		object-fit: var(--dry-image-object-fit);
	}

	img[data-state='loaded'],
	img[data-state='fallback'] {
		outline: 1px solid var(--dry-image-edge);
		outline-offset: -1px;
	}

	img[data-state='fallback'] {
		opacity: 0.95;
	}
</style>
