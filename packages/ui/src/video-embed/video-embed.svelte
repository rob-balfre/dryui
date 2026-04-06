<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

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

	function applyAspectRatio(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('aspect-ratio', aspectRatio);
		});
	}
</script>

<div
	data-video-embed
	data-provider={detectedProvider}
	data-activated={activated || autoplay ? '' : undefined}
	class={className}
	{@attach applyAspectRatio}
	{...rest}
>
	{#if activated || autoplay}
		{#if detectedProvider === 'native'}
			<video
				data-part="media"
				src={embedSrc}
				{title}
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
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
			></iframe>
		{/if}
	{:else}
		<button
			type="button"
			onclick={activate}
			aria-label="Play video{title ? `: ${title}` : ''}"
			data-part="play-button"
		>
			{#if poster}
				<img data-part="poster" src={poster} alt="" />
			{/if}
			{#if playButton}
				{@render playButton()}
			{:else}
				<svg data-part="play-icon" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
					<circle cx="24" cy="24" r="24" fill="rgba(0,0,0,0.6)" />
					<polygon points="18,14 36,24 18,34" fill="white" />
				</svg>
			{/if}
		</button>
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
	}

	[data-video-embed] [data-part='media'] {
		height: 100%;
		object-fit: cover;
		border: 0;
	}

	[data-video-embed] [data-part='play-button'] {
		display: grid;
		place-items: center;
		height: 100%;
		border: 0;
		cursor: pointer;
		position: relative;
		background: none;
		padding: 0;
	}

	[data-video-embed] [data-part='poster'] {
		height: 100%;
		object-fit: cover;
		position: absolute;
		inset: 0;
	}

	[data-video-embed] [data-part='play-button']:hover [data-part='play-icon'] circle {
		fill: rgb(15 23 42 / 0.8);
	}

	[data-video-embed] [data-part='play-icon'] {
		position: relative;
		z-index: 1;
		height: var(--dry-video-embed-play-size);
		aspect-ratio: 1;
		filter: drop-shadow(0 2px 8px rgb(15 23 42 / 0.3));
		transition: transform var(--dry-duration-normal, 200ms) ease;
	}

	[data-video-embed] [data-part='play-button']:hover [data-part='play-icon'] {
		transform: scale(1.1);
	}
</style>
