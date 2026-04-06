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
	data-provider={detectedProvider}
	data-activated={activated || autoplay ? '' : undefined}
	use:applyAspectRatio
	{...rest}
>
	{#if activated || autoplay}
		{#if detectedProvider === 'native'}
			<video
				src={embedSrc}
				{title}
				controls
				autoplay={autoplay || activated}
				{poster}
				class="ve-media"
			>
				<track kind="captions" />
			</video>
		{:else}
			<iframe
				src={embedSrc}
				{title}
				frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowfullscreen
				class="ve-media ve-iframe"
			></iframe>
		{/if}
	{:else}
		<button
			type="button"
			onclick={activate}
			aria-label="Play video{title ? `: ${title}` : ''}"
			data-part="play-button"
			class="ve-play-button"
		>
			{#if poster}
				<img src={poster} alt="" class="ve-poster" />
			{/if}
			{#if playButton}
				{@render playButton()}
			{:else}
				<svg
					data-part="play-icon"
					viewBox="0 0 48 48"
					width="48"
					height="48"
					class="ve-play-icon"
					aria-hidden="true"
				>
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
	.ve-media {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.ve-iframe {
		border: 0;
	}

	.ve-play-button {
		width: 100%;
		height: 100%;
		border: 0;
		cursor: pointer;
		position: relative;
		background: none;
		padding: 0;
	}

	.ve-poster {
		width: 100%;
		height: 100%;
		object-fit: cover;
		position: absolute;
		inset: 0;
	}

	.ve-play-icon {
		position: relative;
		z-index: 1;
	}
</style>
