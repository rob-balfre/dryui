<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		src?: string;
		alt?: string;
		fallback?: string;
		size?: 'sm' | 'md' | 'lg';
		shape?: 'circle' | 'square';
		status?: 'online' | 'offline' | 'busy' | 'away';
		badge?: Snippet;
		children?: Snippet;
	}

	let {
		src,
		alt = '',
		fallback,
		size = 'md',
		shape = 'circle',
		status,
		badge,
		class: className,
		children,
		...rest
	}: Props = $props();

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

	const hasOverlay = $derived(!!status || !!badge);
</script>

{#if hasOverlay}
	<div data-avatar-wrapper data-shape={shape} class={className} {...rest}>
		<span role="img" aria-label={alt} data-avatar {...variantAttrs({ size, shape })}>
			{#if showImage}
				<img {src} {alt} onerror={handleError} />
			{:else if children}
				{@render children()}
			{:else}
				<span aria-hidden="true">{getFallbackText()}</span>
			{/if}
		</span>
		{#if status}
			<span data-avatar-status data-status={status}></span>
		{/if}
		{#if badge}
			<span data-avatar-badge>{@render badge()}</span>
		{/if}
	</div>
{:else}
	<span
		role="img"
		aria-label={alt}
		data-avatar
		{...variantAttrs({ size, shape })}
		class={className}
		{...rest}
	>
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
	[data-avatar-wrapper] {
		position: relative;
		display: inline-grid;
	}

	[data-avatar] {
		--dry-avatar-size: 40px;
		--dry-avatar-radius: var(--dry-radius-full);
		--dry-avatar-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));

		display: inline-grid;
		place-items: center;
		aspect-ratio: 1;
		height: var(--dry-avatar-size);
		border-radius: var(--dry-avatar-radius);
		background: var(--dry-avatar-bg, var(--dry-color-fill));
		color: var(--dry-avatar-color, var(--dry-color-text-weak));
		font-family: var(--dry-font-sans);
		font-size: var(--dry-avatar-font-size);
		font-weight: 600;
		line-height: 1;
		outline: 1px solid var(--dry-image-edge);
		outline-offset: -1px;
		overflow: hidden;
		user-select: none;
	}

	[data-avatar] img {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		border-radius: inherit;
	}

	[data-avatar] > span {
		display: grid;
		place-items: center;
	}

	/* ── Shapes ───────────────────────────────────────────────────────────────── */

	[data-shape='circle'] {
		--dry-avatar-radius: var(--dry-radius-full);
	}

	[data-shape='square'] {
		--dry-avatar-radius: var(--dry-radius-md);
	}

	/* ── Sizes ────────────────────────────────────────────────────────────────── */

	[data-size='sm'] {
		--dry-avatar-size: 32px;
		--dry-avatar-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	[data-size='md'] {
		--dry-avatar-size: var(--dry-space-12);
		--dry-avatar-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
	}

	[data-size='lg'] {
		--dry-avatar-size: var(--dry-space-16);
		--dry-avatar-font-size: var(--dry-type-small-size, var(--dry-text-base-size));
	}

	/* ── Status indicator ─────────────────────────────────────────────────────── */

	/* For circular avatars the corner is empty space; offset the dot inward
	   by ~6% so its centre lands on the rim near the 4-5 o'clock position. */
	[data-avatar-status] {
		position: absolute;
		bottom: var(--dry-avatar-status-offset, 6%);
		right: var(--dry-avatar-status-offset, 6%);
		aspect-ratio: 1;
		height: var(--dry-avatar-status-size, 28%);
		max-height: 14px;
		min-height: 8px;
		border-radius: 50%;
		border: 2px solid var(--dry-color-bg-base);
		box-shadow: 0 0 0 1px color-mix(in srgb, var(--dry-color-stroke-weak) 60%, transparent);
		z-index: 1;
	}

	[data-avatar-wrapper][data-shape='square'] [data-avatar-status] {
		bottom: 0;
		right: 0;
		transform: translate(25%, 25%);
	}

	[data-avatar-status][data-status='online'] {
		background-color: var(--dry-avatar-status-color, var(--dry-color-fill-success));
	}

	[data-avatar-status][data-status='offline'] {
		background-color: var(--dry-avatar-status-color, var(--dry-color-icon));
	}

	[data-avatar-status][data-status='busy'] {
		background-color: var(--dry-avatar-status-color, var(--dry-color-fill-error));
	}

	[data-avatar-status][data-status='away'] {
		background-color: var(--dry-avatar-status-color, var(--dry-color-fill-warning));
	}

	/* ── Badge overlay ───────────────────────────────────────────────────────── */

	[data-avatar-badge] {
		position: absolute;
		top: -2px;
		right: -2px;
		z-index: 1;
	}
</style>
