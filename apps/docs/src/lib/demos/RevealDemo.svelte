<script lang="ts">
	import { Reveal, Text } from '@dryui/ui';
	import { TrendingUp, Users, Zap } from 'lucide-svelte';

	const features = [
		{
			id: 'perf',
			icon: Zap,
			title: 'Runtime under 18kb',
			body: 'Ships a single ESM bundle, gzipped, with no runtime CSS-in-JS tax.'
		},
		{
			id: 'usage',
			icon: Users,
			title: '640+ projects adopted',
			body: 'Indie apps, consultancies, and three top-20 fintechs since the 1.0 cut.'
		},
		{
			id: 'growth',
			icon: TrendingUp,
			title: 'Up 3x since Q1',
			body: 'Docs traffic triples month over month as people find the component catalog.'
		}
	];
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Scroll reveal</p>
		<Text color="secondary" size="sm">
			Reveal uses IntersectionObserver to play entrance variants once the section crosses the
			viewport threshold. Reduced-motion disables the translate and blur.
		</Text>
	</div>

	<div class="grid">
		{#each features as feature, index (feature.id)}
			<Reveal variant="slide-up" delay={index * 90}>
				<article class="feature">
					<div class="feature-icon" aria-hidden="true">
						<feature.icon size={18} strokeWidth={2} />
					</div>
					<div class="feature-copy">
						<p class="feature-title">{feature.title}</p>
						<p class="feature-body">{feature.body}</p>
					</div>
				</article>
			</Reveal>
		{/each}
	</div>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}

	.feature {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 54%, transparent);
	}

	.feature-icon {
		display: grid;
		place-items: center;
		block-size: 2rem;
		aspect-ratio: 1;
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-fill-brand) 22%, var(--dry-color-bg-base));
		color: var(--dry-color-text-strong);
	}

	.feature-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.feature-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.feature-body {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}
</style>
