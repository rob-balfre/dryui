<script lang="ts">
	import { GodRays, Text } from '@dryui/ui';
</script>

<div class="demo">
	<div class="stage">
		<GodRays
			color="rgba(255, 244, 214, 0.42)"
			rayCount={14}
			intensity={92}
			center={{ x: 0.52, y: 0.1 }}
			speed={0}
		>
			<div class="scene">
				<div class="source" aria-hidden="true"></div>

				<div class="hero">
					<p class="eyebrow">Ambient light system</p>
					<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
					<h3>A clear source, a dark surface, and enough content to catch the beams.</h3>
					<Text color="secondary">
						The demo shows what GodRays is for: soft editorial lighting that frames a panel instead
						of vanishing into an empty wrapper.
					</Text>
				</div>

				<div class="grid" aria-label="Lighting summary">
					<div class="card">
						<p class="label">Source</p>
						<p class="value">Top-centered orb</p>
					</div>
					<div class="card">
						<p class="label">Spread</p>
						<p class="value">14 rays, high intensity</p>
					</div>
					<div class="card">
						<p class="label">Use case</p>
						<p class="value">Hero panels and feature callouts</p>
					</div>
				</div>
			</div>
		</GodRays>
	</div>
</div>

<style>
	.demo {
		display: grid;
	}

	.stage {
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		border: 1px solid var(--dry-color-stroke-weak);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01)),
			linear-gradient(135deg, rgba(255, 175, 92, 0.12), transparent 34%),
			linear-gradient(315deg, rgba(120, 163, 255, 0.12), transparent 38%),
			var(--dry-color-bg-raised);
	}

	.scene {
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-4);
		border-radius: calc(var(--dry-radius-lg) - 0.2rem);
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			radial-gradient(circle at 50% 10%, rgba(255, 244, 214, 0.16), transparent 26%),
			linear-gradient(180deg, rgba(17, 18, 24, 0.9), rgba(13, 14, 18, 0.96));
	}

	.source {
		justify-self: center;
		block-size: 5rem;
		aspect-ratio: 1;
		border-radius: 999px;
		background:
			radial-gradient(
				circle,
				rgba(255, 250, 240, 0.96) 0%,
				rgba(255, 223, 160, 0.68) 40%,
				transparent 70%
			),
			radial-gradient(circle, rgba(255, 255, 255, 0.42) 0%, transparent 64%);
		box-shadow:
			0 0 3rem rgba(255, 226, 154, 0.25),
			0 0 7rem rgba(255, 190, 92, 0.16);
	}

	.hero,
	.card {
		display: grid;
		gap: var(--dry-space-2);
		border-radius: var(--dry-radius-md);
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: color-mix(in srgb, var(--dry-color-bg-raised) 72%, transparent);
	}

	.hero {
		padding: var(--dry-space-5);
	}

	.eyebrow,
	.label,
	.value,
	.hero h3 {
		margin: 0;
	}

	.eyebrow,
	.label {
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-size: 0.72rem;
		color: var(--dry-color-text-weak);
	}

	.hero h3 {
		font-size: clamp(1.6rem, 3vw, 2.2rem);
		line-height: 1;
		color: var(--dry-color-text-strong);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--dry-space-3);
	}

	.card {
		padding: var(--dry-space-4);
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02)),
			color-mix(in srgb, var(--dry-color-bg-raised) 76%, transparent);
	}

	.value {
		color: var(--dry-color-text-strong);
	}
</style>
