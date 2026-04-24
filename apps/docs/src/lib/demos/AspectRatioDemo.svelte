<script lang="ts">
	import { AspectRatio, Text } from '@dryui/ui';
	import { Play } from 'lucide-svelte';
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
				<div class="slot slot-video" aria-label="Product demo video, paused">
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
				<div class="slot slot-image" aria-hidden="true">
					<div class="ring"></div>
					<div class="orb"></div>
				</div>
			</AspectRatio>
			<figcaption class="caption">4 / 5 · Portrait poster</figcaption>
		</figure>

		<figure class="frame">
			<AspectRatio ratio={1200 / 630}>
				<div class="slot slot-og">
					<div class="og-head">
						<span class="og-dot"></span>
						<span class="og-dot"></span>
						<span class="og-dot"></span>
					</div>
					<p class="og-title">DryUI 1.4</p>
					<p class="og-sub">Composable Svelte 5 primitives, no dependencies.</p>
					<p class="og-url">dryui.dev</p>
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
	}

	.slot-video {
		place-items: center;
		background:
			radial-gradient(circle at 40% 32%, rgba(251, 146, 60, 0.34) 0, transparent 42%),
			radial-gradient(circle at 78% 70%, rgba(56, 189, 248, 0.26) 0, transparent 48%),
			color-mix(in srgb, var(--dry-color-bg-base) 88%, black);
	}

	.play {
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

	.slot-image {
		place-items: center;
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--dry-color-fill-brand) 28%, var(--dry-color-bg-base)),
			color-mix(in srgb, var(--dry-color-bg-base) 84%, black)
		);
	}

	.ring {
		position: absolute;
		inset: 18%;
		border: 2px solid color-mix(in srgb, white 24%, transparent);
		border-radius: 50%;
	}

	.orb {
		block-size: 40%;
		aspect-ratio: 1;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(255, 250, 240, 0.92) 0%,
			rgba(255, 223, 160, 0.5) 42%,
			transparent 72%
		);
		filter: blur(1px);
	}

	.slot-og {
		align-content: space-between;
		padding: var(--dry-space-5);
		background: linear-gradient(
			140deg,
			color-mix(in srgb, var(--dry-color-bg-base) 92%, black),
			color-mix(in srgb, var(--dry-color-fill-brand) 18%, var(--dry-color-bg-base))
		);
	}

	.og-head {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: 0.35rem;
	}

	.og-dot {
		display: block;
		block-size: 0.55rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: color-mix(in srgb, var(--dry-color-text-strong) 30%, transparent);
	}

	.og-title,
	.og-sub,
	.og-url {
		margin: 0;
	}

	.og-title {
		font-size: clamp(1.2rem, 2.8cqw, 1.8rem);
		font-weight: 700;
		color: var(--dry-color-text-strong);
		line-height: 1.1;
	}

	.og-sub {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.45;
	}

	.og-url {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		color: var(--dry-color-text-weak);
	}

	.caption {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		color: var(--dry-color-text-weak);
	}
</style>
