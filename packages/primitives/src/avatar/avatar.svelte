<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		src?: string;
		alt?: string;
		fallback?: string;
		status?: 'online' | 'offline' | 'busy' | 'away';
		badge?: Snippet;
		children?: Snippet | undefined;
	}

	let { src, alt = '', fallback, status, badge, children, ...rest }: Props = $props();

	let failedSrc = $state<string | null>(null);
	const showImage = $derived(Boolean(src) && src !== failedSrc);

	function handleError() {
		failedSrc = src ?? null;
	}

	function getFallbackText(): string {
		const source = (fallback ?? alt).trim();
		if (!source) return '';

		const words = source.split(/\s+/).filter(Boolean);
		if (words.length > 1) {
			return words
				.slice(0, 2)
				.map((word) => Array.from(word)[0] ?? '')
				.join('')
				.toUpperCase();
		}

		const compact = source.replace(/[^\p{L}\p{N}]+/gu, '');
		const characters = Array.from(compact || source);
		return characters.slice(0, 2).join('').toUpperCase();
	}
</script>

{#if status || badge}
	<div data-part="wrapper" class="avatar-wrapper">
		<span role="img" aria-label={alt} {...rest}>
			{#if showImage}
				<img {src} {alt} onerror={handleError} />
			{:else if children}
				{@render children()}
			{:else}
				<span aria-hidden="true">{getFallbackText()}</span>
			{/if}
		</span>
		{#if status}
			<span data-part="status" data-status={status}></span>
		{/if}
		{#if badge}
			<span data-part="badge">{@render badge()}</span>
		{/if}
	</div>
{:else}
	<span role="img" aria-label={alt} {...rest}>
		{#if showImage}
			<img {src} {alt} onerror={handleError} />
		{:else if children}
			{@render children()}
		{:else}
			<span aria-hidden="true">{getFallbackText()}</span>
		{/if}
	</span>
{/if}

<style>
	.avatar-wrapper {
		position: relative;
		display: inline-flex;
	}
</style>
