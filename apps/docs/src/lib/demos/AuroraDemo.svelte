<script lang="ts">
	import { Aurora, Badge, Text } from '@dryui/ui';
</script>

<div class="demo-shell">
	<div class="demo-grid">
		<div class="hero-aurora">
			<Aurora palette="ocean" speed="slow" intensity={82} waviness={58}>
				<div class="hero-shell">
					<div class="hero-heading">
						<div class="hero-meta">
							<Badge variant="outline" color="gray">Ocean</Badge>
							<p class="hero-kicker">Browser-native ambience</p>
						</div>

						<div class="hero-copy">
							<h3 class="hero-title">Ambient background effect</h3>
							<Text color="secondary">
								Layered gradients drift when the browser can animate custom properties, then
								fall back to a static surface when it cannot.
							</Text>
						</div>
					</div>

					<div class="feature-grid">
						<div class="feature">
							<p class="feature-label">Motion</p>
							<p class="feature-value">Respects reduced motion automatically.</p>
						</div>

						<div class="feature">
							<p class="feature-label">Runtime</p>
							<p class="feature-value">Ambient depth without canvas or shaders.</p>
						</div>

						<div class="feature">
							<p class="feature-label">Best for</p>
							<p class="feature-value">Hero panels, promo rails, and soft section framing.</p>
						</div>
					</div>
				</div>
			</Aurora>
		</div>

		<div class="mini-aurora">
			<Aurora palette="sunrise" speed="fast" intensity={70} waviness={42}>
				<div class="mini-shell">
					<p class="mini-label">Sunrise</p>
					<h4 class="mini-title">Warm launch surface</h4>
					<Text color="secondary" size="sm">
						A brighter preset for promotional callouts and high-energy hero moments.
					</Text>
				</div>
			</Aurora>
		</div>

		<div class="mini-aurora">
			<Aurora
				palette={['rgba(56, 189, 248, 0.52)', 'rgba(16, 185, 129, 0.44)', 'rgba(59, 130, 246, 0.46)']}
				speed={0.8}
				intensity={76}
				waviness={64}
			>
				<div class="mini-shell">
					<p class="mini-label">Custom tuple</p>
					<h4 class="mini-title">Editorial calm</h4>
					<Text color="secondary" size="sm">
						Swap in your own three-color tuple when the built-in palettes are close but not exact.
					</Text>
				</div>
			</Aurora>
		</div>
	</div>
</div>

<style>
	.demo-shell {
		container-type: inline-size;
	}

	.demo-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.hero-aurora,
	.mini-aurora {
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: var(--dry-radius-xl);
	}

	.hero-aurora {
		grid-column: 1 / -1;
	}

	.hero-shell,
	.mini-shell {
		position: relative;
		z-index: 1;
		display: grid;
		gap: var(--dry-space-4);
		padding: var(--dry-space-6);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 84%, transparent);
		backdrop-filter: blur(18px);
	}

	.hero-shell {
		min-block-size: 17rem;
		align-content: space-between;
	}

	.mini-shell {
		min-block-size: 11rem;
		align-content: end;
	}

	.hero-heading,
	.hero-copy,
	.hero-meta,
	.feature-grid,
	.feature {
		display: grid;
	}

	.hero-copy {
		gap: var(--dry-space-2);
		grid-template-columns: minmax(0, 38rem);
	}

	.hero-meta {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		justify-content: start;
		gap: var(--dry-space-3);
	}

	.hero-kicker,
	.feature-label,
	.feature-value,
	.mini-label,
	.hero-title,
	.mini-title {
		margin: 0;
	}

	.hero-kicker,
	.mini-label,
	.feature-label {
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.feature-grid {
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.feature {
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-base) 78%, transparent);
	}

	.feature-value {
		color: var(--dry-color-text-strong);
		line-height: 1.5;
	}

	.hero-title,
	.mini-title {
		font-family: var(--dry-font-sans);
		line-height: 1.1;
		color: var(--dry-color-text-strong);
	}

	.hero-title {
		font-size: clamp(1.75rem, 2.8vw, 2.5rem);
	}

	.mini-title {
		font-size: var(--dry-text-xl-size);
	}

	@container (max-width: 45rem) {
		.demo-grid,
		.feature-grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
