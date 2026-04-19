<script lang="ts">
	import { Carousel } from '../../../packages/ui/src/carousel/index.js';

	interface Props {
		autoplay?: number | false;
		controlPattern?: 'dots' | 'thumbnails';
		loop?: boolean;
	}

	let { autoplay = false, controlPattern = 'dots', loop = true }: Props = $props();

	const slides = [
		{
			id: 'launch',
			title: 'Launch updates',
			description: 'Release notes and onboarding highlights.'
		},
		{
			id: 'metrics',
			title: 'Performance metrics',
			description: 'Surface the key numbers for the current cycle.'
		},
		{
			id: 'support',
			title: 'Support queue',
			description: 'Point the team at the next operational priority.'
		}
	];
</script>

<div class="harness">
	<Carousel.Root {autoplay} {loop} aria-label="Featured stories" data-testid="carousel-root">
		<Carousel.Viewport data-testid="carousel-viewport">
			{#each slides as slide (slide.id)}
				<Carousel.Slide data-testid={`slide-${slide.id}`}>
					<article class="slide-card">
						<h2>{slide.title}</h2>
						<p>{slide.description}</p>
						<a href={`#${slide.id}`}>Read more</a>
					</article>
				</Carousel.Slide>
			{/each}
		</Carousel.Viewport>

		{#if controlPattern === 'dots'}
			<Carousel.Dots data-testid="carousel-dots" />
		{:else}
			<Carousel.Thumbnails data-testid="carousel-thumbnails">
				{#snippet children({ index, isActive })}
					<span data-testid={`thumb-${index + 1}`} data-active={isActive ? '' : undefined}>
						Preview {index + 1}
					</span>
				{/snippet}
			</Carousel.Thumbnails>
		{/if}
	</Carousel.Root>
</div>

<style>
	.harness {
		width: min(32rem, 100%);
	}

	.slide-card {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
	}

	h2,
	p {
		margin: 0;
	}
</style>
