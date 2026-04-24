<script lang="ts">
	import { ChromaticShift, Text } from '@dryui/ui';
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Product tiles</p>
		<Text color="secondary" size="sm">
			ChromaticShift splits R/G/B channels on the wrapped content. Good as a hover accent on catalog
			tiles or a subtle ambient drift on hero media.
		</Text>
	</div>

	<div class="grid">
		<ChromaticShift offset={4} trigger="hover">
			<article class="tile">
				<div class="art art-zen" aria-hidden="true"></div>
				<div class="tile-body">
					<p class="tile-eyebrow">New</p>
					<p class="tile-title">Zen Deck</p>
					<p class="tile-price">$12/mo</p>
				</div>
			</article>
		</ChromaticShift>

		<ChromaticShift offset={4} trigger="hover">
			<article class="tile">
				<div class="art art-pulse" aria-hidden="true"></div>
				<div class="tile-body">
					<p class="tile-eyebrow">Updated</p>
					<p class="tile-title">Pulse Timer</p>
					<p class="tile-price">$8/mo</p>
				</div>
			</article>
		</ChromaticShift>

		<ChromaticShift offset={3} trigger="always" animated>
			<article class="tile tile-featured">
				<div class="art art-prism" aria-hidden="true"></div>
				<div class="tile-body">
					<p class="tile-eyebrow">Featured</p>
					<p class="tile-title">Prism Studio</p>
					<p class="tile-price">$24/mo</p>
				</div>
			</article>
		</ChromaticShift>
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
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--dry-space-3);
	}

	.tile {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 58%, transparent);
	}

	.tile-featured {
		border-color: color-mix(in srgb, var(--dry-color-fill-brand) 36%, transparent);
	}

	.art {
		aspect-ratio: 4 / 3;
		border-radius: var(--dry-radius-md);
		background-color: color-mix(in srgb, var(--dry-color-bg-base) 88%, black);
	}

	.art-zen {
		background-image:
			radial-gradient(circle at 25% 30%, rgba(56, 189, 248, 0.5) 0%, transparent 55%),
			radial-gradient(circle at 78% 70%, rgba(34, 197, 94, 0.42) 0%, transparent 55%);
	}

	.art-pulse {
		background-image:
			radial-gradient(circle at 30% 30%, rgba(251, 146, 60, 0.55) 0%, transparent 55%),
			radial-gradient(circle at 78% 74%, rgba(244, 114, 182, 0.5) 0%, transparent 60%);
	}

	.art-prism {
		background-image:
			radial-gradient(circle at 22% 28%, rgba(167, 139, 250, 0.6) 0%, transparent 60%),
			radial-gradient(circle at 70% 30%, rgba(251, 146, 60, 0.4) 0%, transparent 58%),
			radial-gradient(circle at 55% 80%, rgba(56, 189, 248, 0.45) 0%, transparent 60%);
	}

	.tile-body {
		display: grid;
		gap: 0.15rem;
		padding: 0 var(--dry-space-2) var(--dry-space-2);
	}

	.tile-eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.tile-title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.tile-price {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
</style>
