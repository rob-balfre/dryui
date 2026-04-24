<script lang="ts">
	import { asset } from '$app/paths';
	import { Image, Text } from '@dryui/ui';
	import { AlertTriangle } from 'lucide-svelte';
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
				<Image
					src={asset('/examples/mountain-landscape.svg')}
					alt="Mountain landscape at sunrise"
				/>
			</div>
			<figcaption class="caption">
				<p class="caption-title">Sunrise ridge</p>
				<p class="caption-note">Object-cover, lazy loading, crisp on retina.</p>
			</figcaption>
		</figure>

		<figure class="card">
			<div class="frame frame-portrait">
				<Image src={asset('/examples/mountain-landscape.svg')} alt="Second peak from the trail" />
			</div>
			<figcaption class="caption">
				<p class="caption-title">Trail crop</p>
				<p class="caption-note">Same source, 4:5 frame, shared styling.</p>
			</figcaption>
		</figure>

		<figure class="card">
			<div class="frame">
				<Image
					src="https://images.example.invalid/missing.png"
					alt="Broken source example"
					fallback="Missing asset"
				/>
			</div>
			<figcaption class="caption">
				<p class="caption-title">
					<span class="error-dot" aria-hidden="true">
						<AlertTriangle size={12} strokeWidth={2.25} />
					</span>
					Broken source
				</p>
				<p class="caption-note">Fallback text renders when the URL 404s or throws.</p>
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
</style>
