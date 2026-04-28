<script lang="ts">
	import { Adjust, Badge, Text } from '@dryui/ui';
</script>

<div class="demo-shell">
	<div class="comparison-grid">
		<div class="sample-card">
			<div class="sample-header">
				<Badge variant="outline" color="gray">Original</Badge>
				<p class="sample-kicker">Reference surface</p>
			</div>

			<div class="sample-visual">
				<div class="hero-chip hero-chip-sun"></div>
				<div class="hero-chip hero-chip-lagoon"></div>
				<div class="hero-chip hero-chip-violet"></div>
			</div>

			<div class="sample-copy">
				<h3 class="sample-title">Unfiltered card</h3>
				<Text color="secondary">
					This is the same composition with no filter adjustment applied.
				</Text>
			</div>
		</div>

		<Adjust brightness={128} contrast={145} saturate={230} hueRotate={160}>
			<div class="sample-card adjusted-card">
				<div class="sample-header">
					<Badge variant="outline" color="gray">Adjusted</Badge>
					<p class="sample-kicker">High-impact preset</p>
				</div>

				<div class="sample-visual">
					<div class="hero-chip hero-chip-sun"></div>
					<div class="hero-chip hero-chip-lagoon"></div>
					<div class="hero-chip hero-chip-violet"></div>
				</div>

				<div class="sample-copy">
					<h3 class="sample-title">Hue-shifted output</h3>
					<Text color="secondary">
						This one should read instantly: hue rotation remaps the palette while brightness,
						contrast, and saturation push the result harder.
					</Text>
					<p class="value-note">
						`brightness(1.28) contrast(1.45) saturate(2.3) hue-rotate(160deg)`
					</p>
				</div>
			</div>
		</Adjust>
	</div>

	<div class="preset-strip">
		<Adjust contrast={140} brightness={112}>
			<div class="preset-card">
				<p class="preset-label">Contrast Boost</p>
			</div>
		</Adjust>

		<Adjust grayscale={100} contrast={118}>
			<div class="preset-card">
				<p class="preset-label">Monochrome</p>
			</div>
		</Adjust>

		<Adjust sepia={100} saturate={180} brightness={110}>
			<div class="preset-card">
				<p class="preset-label">Sepia Tint</p>
			</div>
		</Adjust>
	</div>
</div>

<style>
	.demo-shell {
		position: relative;
		overflow: hidden;
		container-type: inline-size;
		display: grid;
		padding: var(--dry-space-6);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--dry-color-bg-base) 82%, var(--dry-color-bg-overlay)),
			color-mix(in srgb, var(--dry-color-bg-overlay) 94%, transparent)
		);
	}

	.demo-shell::before {
		content: '';
		position: absolute;
		inset: -20%;
		background:
			linear-gradient(
				118deg,
				rgba(251, 146, 60, 0.16) 0 14%,
				transparent 14% 28%,
				rgba(45, 212, 191, 0.16) 28% 44%,
				transparent 44% 60%,
				rgba(167, 139, 250, 0.14) 60% 76%,
				transparent 76% 100%
			),
			repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.028) 0 1px, transparent 1px 3.25rem);
		opacity: 0.9;
	}

	.comparison-grid,
	.preset-strip,
	.sample-card,
	.preset-card,
	.sample-header,
	.sample-visual,
	.sample-copy {
		display: grid;
	}

	.comparison-grid {
		position: relative;
		z-index: 1;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.sample-card {
		gap: var(--dry-space-4);
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 74%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 82%, transparent)
		);
		box-shadow: 0 18px 42px color-mix(in srgb, black 18%, transparent);
	}

	.adjusted-card {
		border-color: color-mix(in srgb, var(--dry-color-fill-brand) 20%, var(--dry-color-stroke-weak));
	}

	.preset-strip {
		position: relative;
		z-index: 1;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
		margin-top: var(--dry-space-4);
	}

	.preset-card {
		min-block-size: 6.5rem;
		align-content: end;
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-lg);
		background:
			linear-gradient(
				122deg,
				rgba(251, 146, 60, 0.9) 0 18%,
				rgba(244, 114, 182, 0.42) 18% 32%,
				rgba(45, 212, 191, 0.82) 32% 54%,
				rgba(14, 165, 233, 0.4) 54% 68%,
				rgba(167, 139, 250, 0.8) 68% 84%,
				rgba(99, 102, 241, 0.34) 84% 100%
			),
			linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0, transparent 46%),
			repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0 1px, transparent 1px 2.75rem),
			linear-gradient(
				145deg,
				color-mix(in srgb, var(--dry-color-bg-overlay) 78%, transparent),
				color-mix(in srgb, var(--dry-color-bg-base) 84%, transparent)
			);
		box-shadow: 0 16px 36px color-mix(in srgb, black 16%, transparent);
	}

	.sample-header {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.sample-kicker,
	.sample-title {
		margin: 0;
	}

	.sample-kicker {
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.preset-label,
	.value-note {
		margin: 0;
	}

	.sample-visual {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-lg);
		background: linear-gradient(
			135deg,
			color-mix(in srgb, white 5%, transparent),
			color-mix(in srgb, black 16%, transparent)
		);
	}

	.hero-chip {
		min-block-size: 8rem;
		border-radius: calc(var(--dry-radius-lg) * 0.95);
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, white 24%, transparent),
			0 10px 24px color-mix(in srgb, black 14%, transparent);
	}

	.hero-chip-sun {
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.22), transparent),
			linear-gradient(145deg, rgba(251, 146, 60, 0.92), rgba(244, 114, 182, 0.76));
	}

	.hero-chip-lagoon {
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent),
			linear-gradient(145deg, rgba(45, 212, 191, 0.92), rgba(14, 165, 233, 0.76));
	}

	.hero-chip-violet {
		background:
			linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent),
			linear-gradient(145deg, rgba(167, 139, 250, 0.94), rgba(99, 102, 241, 0.74));
	}

	.sample-copy {
		gap: var(--dry-space-2);
	}

	.sample-title {
		font-size: var(--dry-text-2xl-size);
		line-height: 1.05;
		color: var(--dry-color-text-strong);
	}

	.value-note {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.preset-label {
		font-size: var(--dry-text-sm-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	@container (max-width: 48rem) {
		.comparison-grid,
		.preset-strip {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
