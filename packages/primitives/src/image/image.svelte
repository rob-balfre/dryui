<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLImgAttributes } from 'svelte/elements';

	interface Props extends HTMLImgAttributes {
		fallback?: string;
		fallbackSnippet?: Snippet;
	}

	let { fallback, fallbackSnippet, src, alt = '', loading = 'lazy', ...rest }: Props = $props();

	let status = $state<'loading' | 'loaded' | 'error'>('loading');

	function handleLoad() {
		status = 'loaded';
	}

	function handleError() {
		status = 'error';
	}

	$effect.pre(() => {
		// Reset status when src changes
		if (src) {
			status = 'loading';
		}
	});
</script>

{#if status === 'error' && fallbackSnippet}
	{@render fallbackSnippet()}
{:else if status === 'error' && fallback}
	<img src={fallback} {alt} data-state="fallback" {...rest} />
{:else}
	<img
		{src}
		{alt}
		{loading}
		data-state={status}
		onload={handleLoad}
		onerror={handleError}
		{...rest}
	/>
{/if}
