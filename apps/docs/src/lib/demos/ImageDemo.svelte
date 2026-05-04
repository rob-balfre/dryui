<script lang="ts">
	import { Image, Text } from '@dryui/ui';
	import { AlertTriangle } from 'lucide-svelte';

	const ridge =
		'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop&q=80';
	const trail =
		'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=640&h=800&fit=crop&q=80';
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Loading and fallback</p>
		<Text color="secondary" size="sm">
			Image covers the frame, swaps in a fallback when the source fails, and exposes loading state
			through the data-state attribute.
		</Text>
	</div>

	<div class="grid">
		<figure class="card">
			<div class="frame">
				<Image src={ridge} alt="Mountain ridge at sunrise" />
			</div>
			<figcaption class="caption">
				<p class="caption-title">Sunrise ridge</p>
				<p class="caption-note">Object-cover, lazy loading, crisp on retina.</p>
			</figcaption>
		</figure>

		<figure class="card">
			<div class="frame frame-portrait">
				<Image src={trail} alt="Hiker on a forest trail" />
			</div>
			<figcaption class="caption">
				<p class="caption-title">Trail crop</p>
				<p class="caption-note">Different source, 4:5 frame, shared styling.</p>
			</figcaption>
		</figure>

		<figure class="card">
			<div class="frame">
				<Image src="https://example.invalid/missing-asset.png" alt="Broken source example">
					{#snippet fallbackSnippet()}
						<div class="fallback">
							<AlertTriangle size={20} strokeWidth={2} aria-hidden="true" />
							<p>Image unavailable</p>
						</div>
					{/snippet}
				</Image>
			</div>
			<figcaption class="caption">
				<p class="caption-title">
					<span class="error-dot" aria-hidden="true">
						<AlertTriangle size={12} strokeWidth={2.25} />
					</span>
					Broken source
				</p>
				<p class="caption-note">Fallback snippet renders when the URL 404s or throws.</p>
			</figcaption>
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

	.card {
		display: grid;
		gap: var(--dry-space-3);
		margin: 0;
	}

	.frame {
		overflow: hidden;
		border-radius: var(--dry-radius-lg);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 64%, transparent);
		aspect-ratio: 16 / 10;
	}

	.frame-portrait {
		aspect-ratio: 4 / 5;
	}

	.caption {
		display: grid;
		gap: 0.2rem;
	}

	.caption-title {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		margin: 0;
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.caption-note {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.error-dot {
		display: grid;
		place-items: center;
		block-size: 1.2rem;
		aspect-ratio: 1;
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-fill-warning) 26%, var(--dry-color-bg-base));
		color: var(--dry-color-text-strong);
	}

	.fallback {
		display: grid;
		place-items: center;
		gap: var(--dry-space-2);
		block-size: 100%;
		padding: var(--dry-space-4);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 60%, var(--dry-color-bg-base));
		color: var(--dry-color-text-weak);
		text-align: center;
	}

	.fallback p {
		margin: 0;
		font-size: var(--dry-text-sm-size);
	}
</style>
