<script lang="ts">
	import { Aurora, Badge, Button, Text } from '@dryui/ui';

	let previewMotionEnabled = $state(false);
</script>

<div class="demo-shell">
	<div class="demo-grid">
		<div class="hero-aurora">
			<Aurora
				palette="ocean"
				speed="normal"
				motion={previewMotionEnabled ? 'auto' : 'never'}
				intensity={96}
				waviness={64}
			>
				<div class="hero-shell">
					<div class="hero-panel">
						<div class="hero-heading">
							<div class="hero-meta">
								<Badge variant="outline" color="gray">Ocean</Badge>
								<p class="hero-kicker">Browser-native ambience</p>
								<div class="preview-toggle" data-pressed={previewMotionEnabled}>
									<Button
										type="button"
										variant="bare"
										aria-pressed={previewMotionEnabled}
										onclick={() => (previewMotionEnabled = !previewMotionEnabled)}
									>
										{previewMotionEnabled ? 'Pause preview' : 'Animate preview'}
									</Button>
								</div>
							</div>

							<div class="hero-copy">
								<h3 class="hero-title">Ambient background effect</h3>
								<Text color="secondary">
									Layered gradients drift when the browser can animate custom properties, then fall
									back to a static surface when it cannot.
								</Text>
								<Text color="secondary" size="sm">
									Docs keep motion opt-in here so the visual stays visible without spinning up the
									GPU until you ask for it.
								</Text>
							</div>
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
			<div class="mini-card mini-card-sunrise" aria-hidden="true"></div>
			<div class="mini-shell">
				<p class="mini-label">Sunrise</p>
				<h4 class="mini-title">Warm launch surface</h4>
				<Text color="secondary" size="sm">
					A brighter preset for promotional callouts and high-energy hero moments.
				</Text>
			</div>
		</div>

		<div class="mini-aurora">
			<div class="mini-card mini-card-custom" aria-hidden="true"></div>
			<div class="mini-shell">
				<p class="mini-label">Custom tuple</p>
				<h4 class="mini-title">Editorial calm</h4>
				<Text color="secondary" size="sm">
					Swap in your own three-color tuple when the built-in palettes are close but not exact.
				</Text>
			</div>
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
		position: relative;
		overflow: hidden;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: var(--dry-radius-xl);
	}

	.hero-aurora {
		grid-column: 1 / -1;
	}

	.hero-shell,
	.hero-panel,
	.mini-shell {
		position: relative;
		z-index: 1;
		display: grid;
		gap: var(--dry-space-4);
	}

	.hero-shell,
	.mini-shell {
		padding: var(--dry-space-6);
	}

	.hero-shell {
		min-block-size: 18rem;
		align-content: space-between;
	}

	.hero-panel {
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 68%, transparent);
		border-radius: var(--dry-radius-xl);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 62%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 74%, transparent)
		);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent);
	}

	.mini-shell {
		min-block-size: 11rem;
		align-content: end;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 68%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 76%, transparent)
		);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent);
	}

	.mini-card {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			145deg,
			color-mix(in srgb, var(--dry-color-bg-base) 82%, var(--dry-color-bg-overlay)),
			color-mix(in srgb, var(--dry-color-bg-overlay) 92%, transparent)
		);
	}

	.mini-card::before,
	.mini-card::after {
		content: '';
		position: absolute;
		inset: -18%;
		border-radius: 50%;
		filter: blur(54px);
		opacity: 0.86;
		mix-blend-mode: screen;
	}

	.mini-card-sunrise::before {
		background:
			radial-gradient(ellipse 72% 30% at 22% 34%, rgba(251, 146, 60, 0.58) 0, transparent 64%),
			radial-gradient(ellipse 56% 38% at 68% 70%, rgba(250, 204, 21, 0.38) 0, transparent 58%);
	}

	.mini-card-sunrise::after {
		background:
			radial-gradient(ellipse 60% 34% at 72% 26%, rgba(244, 114, 182, 0.36) 0, transparent 62%),
			radial-gradient(ellipse 48% 38% at 34% 78%, rgba(251, 191, 36, 0.28) 0, transparent 56%);
	}

	.mini-card-custom::before {
		background:
			radial-gradient(ellipse 70% 30% at 24% 32%, rgba(56, 189, 248, 0.48) 0, transparent 62%),
			radial-gradient(ellipse 52% 36% at 68% 72%, rgba(16, 185, 129, 0.36) 0, transparent 58%);
	}

	.mini-card-custom::after {
		background:
			radial-gradient(ellipse 62% 32% at 74% 24%, rgba(59, 130, 246, 0.42) 0, transparent 62%),
			radial-gradient(ellipse 48% 40% at 28% 76%, rgba(14, 165, 233, 0.3) 0, transparent 56%);
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

	.preview-toggle {
		display: grid;
		justify-items: start;
		padding: 0.45rem 0.8rem;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 78%, transparent);
		border-radius: 999px;
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 74%, transparent);
		color: var(--dry-color-text-strong);
		font: inherit;
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.04em;
		cursor: pointer;
	}

	.preview-toggle[data-pressed='true'] {
		background: color-mix(in srgb, var(--dry-color-primary) 18%, var(--dry-color-bg-overlay));
		border-color: color-mix(in srgb, var(--dry-color-primary) 40%, transparent);
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
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 52%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 68%, transparent)
		);
		box-shadow: 0 14px 32px color-mix(in srgb, var(--dry-color-text-strong) 6%, transparent);
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
