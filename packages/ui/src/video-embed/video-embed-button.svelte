<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		src: string;
		poster?: string;
		title?: string;
		provider?: 'youtube' | 'vimeo' | 'native';
		autoplay?: boolean;
		aspectRatio?: string;
		playButton?: Snippet;
		children?: Snippet;
	}

	let {
		src,
		poster,
		title,
		provider,
		autoplay = false,
		aspectRatio = '16/9',
		playButton,
		children,
		class: className,
		...rest
	}: Props = $props();

	let activated = $state(false);

	const detectedProvider = $derived(
		provider ??
			(src.includes('youtube.com') || src.includes('youtu.be')
				? 'youtube'
				: src.includes('vimeo.com')
					? 'vimeo'
					: 'native')
	);

	const embedSrc = $derived.by(() => {
		if (detectedProvider === 'youtube') {
			const id = src.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]+)/)?.[1];
			return id
				? `https://www.youtube-nocookie.com/embed/${id}${autoplay || activated ? '?autoplay=1' : ''}`
				: src;
		}
		if (detectedProvider === 'vimeo') {
			const id = src.match(/vimeo\.com\/(\d+)/)?.[1];
			return id
				? `https://player.vimeo.com/video/${id}${autoplay || activated ? '?autoplay=1' : ''}`
				: src;
		}
		return src;
	});

	function activate() {
		activated = true;
	}

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.setProperty('--_ratio', aspectRatio);
	});
</script>

<div
	bind:this={el}
	data-video-embed
	data-provider={detectedProvider}
	data-activated={activated || autoplay ? '' : undefined}
	class={className}
	{...rest}
>
	{#if activated || autoplay}
		{#if detectedProvider === 'native'}
			<video
				data-part="media"
				src={embedSrc}
				{title}
				width="100%"
				height="100%"
				controls
				autoplay={autoplay || activated}
				{poster}
			>
				<track kind="captions" />
			</video>
		{:else}
			<iframe
				data-part="media"
				src={embedSrc}
				{title}
				width="100%"
				height="100%"
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		{/if}
	{:else}
		{#if poster}
			<img data-part="poster" src={poster} alt="" />
		{/if}
		<span class="play-btn-slot">
			<Button
				variant="bare"
				type="button"
				onclick={activate}
				aria-label="Play video{title ? `: ${title}` : ''}"
			>
				{#if playButton}
					{@render playButton()}
				{:else}
					<svg data-part="play-icon" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
						<circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)" />
						<polygon points="18,14 36,24 18,34" fill="white" />
					</svg>
				{/if}
			</Button>
		</span>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</div>

<style>
	[data-video-embed] {
		--dry-video-embed-radius: var(--dry-radius-lg, 0.5rem);
		--dry-video-embed-play-size: 4rem;

		display: grid;
		position: relative;
		overflow: hidden;
		border-radius: var(--dry-video-embed-radius);
		background: var(--dry-color-fill, #0f0f0f);
		aspect-ratio: var(--_ratio, 16/9);
	}

	[data-video-embed] [data-part='media'] {
		position: absolute;
		inset: 0;
		height: 100%;
		object-fit: cover;
		border: 0;
	}

	[data-video-embed] [data-part='poster'] {
		height: 100%;
		object-fit: cover;
		position: absolute;
		inset: 0;
	}

	.play-btn-slot {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		z-index: 1;
	}

	[data-video-embed] [data-part='play-icon'] {
		height: var(--dry-video-embed-play-size);
		aspect-ratio: 1;
		filter: drop-shadow(0 2px 8px rgb(15 23 42 / 0.3));
		transform: translateX(1px);
		transition: transform var(--dry-duration-normal) var(--dry-ease-default);
	}

	.play-btn-slot:hover [data-part='play-icon'] {
		transform: translateX(1px) scale(1.1);
	}
</style>
