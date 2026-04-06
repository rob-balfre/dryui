<script lang="ts">
	import {
		Adjust,
		Badge,
		Beam,
		Card,
		ChromaticAberration,
		Glass,
		GodRays,
		Heading,
		QRCode,
		Text,
		Thumbnail
	} from '@dryui/ui';
	import { resolveComponentThumbnailName } from '$lib/component-screenshots';

	interface Props {
		name: string;
	}

	let { name }: Props = $props();
	let thumbnailName = $derived(resolveComponentThumbnailName(name));
</script>

{#if name === 'Adjust'}
	<div class="stage stage-soft">
		<Adjust brightness={1.02} contrast={1.08} saturate={1.28}>
			<Card.Root>
				<Card.Content>
					<div class="copy-stack">
						<Badge variant="soft" color="blue" size="sm">Filter</Badge>
						<Heading level={3}>Adjust</Heading>
						<Text size="sm" color="secondary"
							>Brightness, contrast, and saturation tuned in one pass.</Text
						>
					</div>
				</Card.Content>
			</Card.Root>
		</Adjust>
	</div>
{:else if name === 'Beam'}
	<div class="stage stage-dark">
		<Beam width={5} intensity={62} angle={24} speed={0}>
			<div class="effect-card">
				<Badge variant="soft" size="sm">Directional light</Badge>
				<Heading level={3}>Beam</Heading>
			</div>
		</Beam>
	</div>
{:else if name === 'ChromaticAberration'}
	<div class="stage stage-dark">
		<ChromaticAberration offset={5} angle={18}>
			<div class="effect-card">
				<Badge variant="soft" color="purple" size="sm">RGB split</Badge>
				<Heading level={3}>Chromatic Aberration</Heading>
			</div>
		</ChromaticAberration>
	</div>
{:else if name === 'Glass'}
	<div class="stage stage-spectrum">
		<Glass blur={18} saturation={132}>
			<div class="effect-card glass-card">
				<Badge variant="soft" color="blue" size="sm">Translucent</Badge>
				<Heading level={3}>Glass</Heading>
			</div>
		</Glass>
	</div>
{:else if name === 'GodRays'}
	<div class="stage stage-dark">
		<GodRays rayCount={18} intensity={58} speed={0} center={{ x: 0.5, y: 0.3 }}>
			<div class="effect-card">
				<Badge variant="soft" color="yellow" size="sm">Volumetric</Badge>
				<Heading level={3}>God Rays</Heading>
			</div>
		</GodRays>
	</div>
{:else if name === 'QRCode'}
	<div class="stage stage-soft qr-stage">
		<QRCode
			value="https://dryui.dev/components/qr-code"
			size={280}
			aria-label="dryui QR code preview"
		/>
	</div>
{:else if name === 'Surface'}
	<div class="surface">
		<div class="stage surface-stage">
			<div class="effect-card">
				<Badge variant="soft" size="sm">Stacking context</Badge>
				<Heading level={3}>Surface</Heading>
			</div>
		</div>
	</div>
{:else if name === 'Thumbnail'}
	<div class="stage stage-soft stage-thumbnail">
		<div class="thumbnail-grid">
			<Thumbnail.Root name="Button" size={220} />
			<Thumbnail.Root name="Card" size={220} />
			<Thumbnail.Root name="Tabs" size={220} />
			<Thumbnail.Root name="Chart" size={220} />
		</div>
	</div>
{:else}
	<div class="stage stage-soft">
		<Thumbnail.Root name={thumbnailName} size={720} />
	</div>
{/if}

<style>
	.stage {
		min-block-size: 40rem;
		border-radius: var(--dry-radius-xl);
		padding: var(--dry-space-8);
		container-type: inline-size;
		display: grid;
		place-items: center;
		overflow: hidden;
	}

	.stage-soft {
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 14%, transparent),
				transparent 42%
			),
			linear-gradient(180deg, var(--dry-color-bg-raised), var(--dry-color-bg-base));
	}

	.stage-dark {
		background:
			radial-gradient(
				circle at top,
				color-mix(in srgb, var(--dry-color-fill-brand) 26%, transparent),
				transparent 38%
			),
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--dry-color-bg-inverse, #0c1220) 94%, black),
				color-mix(in srgb, var(--dry-color-bg-inverse, #0c1220) 80%, black)
			);
	}

	.stage-spectrum {
		background:
			radial-gradient(circle at top left, rgba(70, 160, 255, 0.28), transparent 34%),
			radial-gradient(circle at bottom right, rgba(255, 168, 76, 0.2), transparent 40%),
			linear-gradient(145deg, rgba(12, 20, 32, 0.88), rgba(28, 38, 58, 0.82));
	}

	.effect-card {
		min-block-size: 14rem;
		padding: var(--dry-space-6);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-xl);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 88%, transparent);
		display: grid;
		align-content: center;
		justify-items: start;
		gap: var(--dry-space-3);
		box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
	}

	.glass-card {
		background: rgba(255, 255, 255, 0.16);
	}

	.copy-stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.surface {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(145deg, color-mix(in srgb, var(--dry-color-fill-brand) 14%, var(--dry-color-bg-base)), var(--dry-color-bg-base));
	}

	.surface-stage {
		min-block-size: 40rem;
		padding: var(--dry-space-8);
		display: grid;
		place-items: center;
	}

	.qr-stage {
		background:
			radial-gradient(
				circle at top,
				color-mix(in srgb, var(--dry-color-fill-brand) 12%, transparent),
				transparent 40%
			),
			linear-gradient(180deg, #ffffff, color-mix(in srgb, var(--dry-color-bg-base) 94%, white));
	}

	.stage-thumbnail {
		grid-template-columns: minmax(0, 62rem);
	}

	.thumbnail-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-6);
		justify-items: center;
		align-items: center;
	}

	@container (max-width: 48rem) {
		.thumbnail-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
