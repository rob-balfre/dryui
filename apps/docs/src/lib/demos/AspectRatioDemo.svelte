<script lang="ts">
	import { AspectRatio, Text } from '@dryui/ui';
	import { Play } from 'lucide-svelte';

	const video =
		'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1280&h=720&fit=crop&q=80';
	const portrait =
		'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=640&h=800&fit=crop&q=80';
	const og = 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&h=630&fit=crop&q=80';
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Reserve media frames</p>
		<Text color="secondary" size="sm">
			AspectRatio locks a child to a given ratio so images, video, and preview cards stay stable
			while they load.
		</Text>
	</div>

	<div class="grid">
		<figure class="frame">
			<AspectRatio ratio={16 / 9}>
				<div class="slot">
					<img src={video} alt="Product walkthrough thumbnail" loading="lazy" />
					<div class="play" aria-hidden="true">
						<Play size={22} strokeWidth={2} />
					</div>
					<span class="duration">12:48</span>
				</div>
			</AspectRatio>
			<figcaption class="caption">16 / 9 · Product walkthrough</figcaption>
		</figure>

		<figure class="frame">
			<AspectRatio ratio={4 / 5}>
				<div class="slot">
					<img src={portrait} alt="Mountain at dusk" loading="lazy" />
				</div>
			</AspectRatio>
			<figcaption class="caption">4 / 5 · Portrait poster</figcaption>
		</figure>

		<figure class="frame">
			<AspectRatio ratio={1200 / 630}>
				<div class="slot">
					<img src={og} alt="Open graph preview" loading="lazy" />
					<div class="og-overlay">
						<p class="og-title">DryUI 1.4</p>
						<p class="og-sub">Composable Svelte 5 primitives, no dependencies.</p>
						<p class="og-url">dryui.dev</p>
					</div>
				</div>
			</AspectRatio>
			<figcaption class="caption">1200 / 630 · og:image preview</figcaption>
		</figure>
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
		gap: var(--dry-space-4);
	}

	.frame {
		display: grid;
		gap: var(--dry-space-2);
		margin: 0;
	}

	.slot {
		position: relative;
		display: grid;
		block-size: 100%;
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
		isolation: isolate;
	}

	.slot img {
		grid-area: 1 / 1;
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		display: block;
	}

	.play {
		grid-area: 1 / 1;
		align-self: center;
		justify-self: center;
		display: grid;
		place-items: center;
		block-size: 3.5rem;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 92%, transparent);
		color: var(--dry-color-text-strong);
		box-shadow: 0 12px 28px color-mix(in srgb, black 24%, transparent);
	}

	.duration {
		position: absolute;
		inset-inline-end: 0.75rem;
		inset-block-end: 0.75rem;
		padding: 0.2rem 0.55rem;
		border-radius: var(--dry-radius-sm);
		background: color-mix(in srgb, black 58%, transparent);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-inverse);
	}

	.og-overlay {
		grid-area: 1 / 1;
		align-self: end;
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-5);
		background: linear-gradient(0deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0) 70%);
		color: white;
	}

	.og-title,
	.og-sub,
	.og-url {
		margin: 0;
	}

	.og-title {
		font-size: clamp(1.2rem, 2.8cqw, 1.8rem);
		font-weight: 700;
		line-height: 1.1;
	}

	.og-sub {
		font-size: var(--dry-text-sm-size);
		color: rgba(255, 255, 255, 0.85);
		line-height: 1.45;
	}

	.og-url {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		color: rgba(255, 255, 255, 0.75);
	}

	.caption {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		color: var(--dry-color-text-weak);
	}
</style>
