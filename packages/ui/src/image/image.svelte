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
	<img class={className} src={fallback} {alt} data-state="fallback" {...rest} />
{:else}
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
		display: block;
		block-size: var(--dry-image-block-size, auto);
		place-self: var(--dry-image-place-self, auto);
		border-radius: var(--dry-image-radius, var(--dry-radius-lg));
		background: var(--dry-image-bg, var(--dry-color-bg-overlay));
		object-fit: var(--dry-image-object-fit, cover);
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
