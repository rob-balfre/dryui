<script lang="ts">
	import { Svg } from '@dryui/ui';
</script>

<div class="svg-demo">
	<div class="svg-intro">
		<p class="svg-eyebrow">More than a single circle</p>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h3 class="svg-title">
			Use <code>Svg</code> for layered marks, badges, and tiny data visuals.
		</h3>
		<p class="svg-copy">
			The wrapper keeps native SVG semantics, so gradients, labels, and crisp viewBox scaling all
			work without extra ceremony.
		</p>
	</div>

	<div class="svg-grid">
		<article class="demo-card demo-card-feature" data-tone="brand">
			<div class="demo-copy">
				<p class="demo-label">Poster mark</p>
				<p class="demo-description">
					Compose gradients, panels, and motion-ready shapes inside a single semantic graphic.
				</p>
			</div>

			<div class="svg-art svg-art-feature">
				<Svg
					viewBox="0 0 220 160"
					width={220}
					height={160}
					aria-label="Abstract DryUI poster illustration"
				>
					<defs>
						<linearGradient
							id="svg-poster-stroke"
							x1="32"
							y1="28"
							x2="184"
							y2="132"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="var(--dry-color-fill-brand)" />
							<stop offset="100%" stop-color="var(--dry-color-fill-accent)" />
						</linearGradient>
						<radialGradient
							id="svg-poster-glow"
							cx="80"
							cy="56"
							r="96"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="var(--dry-color-fill-brand)" stop-opacity="0.34" />
							<stop offset="100%" stop-color="var(--dry-color-fill-brand)" stop-opacity="0" />
						</radialGradient>
					</defs>

					<rect x="16" y="16" width="188" height="128" rx="30" fill="url(#svg-poster-glow)" />
					<rect
						x="26"
						y="24"
						width="168"
						height="112"
						rx="26"
						fill="none"
						stroke="url(#svg-poster-stroke)"
						stroke-width="2.5"
						opacity="0.9"
					/>
					<path
						d="M48 110C68 96 82 52 110 52C136 52 150 96 172 80"
						fill="none"
						stroke="url(#svg-poster-stroke)"
						stroke-width="11"
						stroke-linecap="round"
					/>
					<circle cx="70" cy="64" r="18" fill="var(--dry-color-fill-accent)" fill-opacity="0.2" />
					<circle cx="156" cy="56" r="11" fill="var(--dry-color-fill-brand)" />
					<circle cx="156" cy="56" r="4.5" fill="var(--dry-color-bg-base)" />
					<path
						d="M88 88L110 66L136 92"
						fill="none"
						stroke="var(--dry-color-text-strong)"
						stroke-width="4"
						stroke-linecap="round"
						stroke-linejoin="round"
						opacity="0.78"
					/>
					<path
						d="M54 126H166"
						fill="none"
						stroke="var(--dry-color-stroke-weak)"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</Svg>
			</div>
		</article>

		<article class="demo-card" data-tone="accent">
			<div class="demo-copy">
				<p class="demo-label">Compass badge</p>
				<p class="demo-description">A compact mark with clear direction and contrast.</p>
			</div>

			<div class="svg-art">
				<Svg viewBox="0 0 120 120" width={92} height={92} aria-label="Compass badge icon">
					<defs>
						<radialGradient
							id="svg-badge-glow"
							cx="60"
							cy="60"
							r="48"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="var(--dry-color-fill-accent)" stop-opacity="0.28" />
							<stop offset="100%" stop-color="var(--dry-color-fill-accent)" stop-opacity="0" />
						</radialGradient>
					</defs>

					<circle cx="60" cy="60" r="40" fill="url(#svg-badge-glow)" />
					<circle
						cx="60"
						cy="60"
						r="30"
						fill="none"
						stroke="var(--dry-color-stroke-accent-strong)"
						stroke-width="3"
					/>
					<path d="M60 20L74 60L60 100L46 60Z" fill="var(--dry-color-fill-accent)" />
					<path d="M60 36L67 60L60 84L53 60Z" fill="var(--dry-color-bg-base)" />
					<circle cx="60" cy="60" r="5" fill="var(--dry-color-text-strong)" />
				</Svg>
			</div>
		</article>

		<article class="demo-card" data-tone="success">
			<div class="demo-copy">
				<p class="demo-label">Mini trend</p>
				<p class="demo-description">Charts and diagnostics read cleanly at small sizes.</p>
			</div>

			<div class="svg-art">
				<Svg
					viewBox="0 0 200 96"
					width={200}
					height={96}
					aria-label="Mini trend chart with rising line"
				>
					<defs>
						<linearGradient
							id="svg-chart-fill"
							x1="0"
							y1="18"
							x2="0"
							y2="84"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="var(--dry-color-fill-success)" stop-opacity="0.26" />
							<stop offset="100%" stop-color="var(--dry-color-fill-info)" stop-opacity="0.04" />
						</linearGradient>
						<linearGradient
							id="svg-chart-line"
							x1="20"
							y1="76"
							x2="180"
							y2="28"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="var(--dry-color-fill-success)" />
							<stop offset="100%" stop-color="var(--dry-color-fill-info)" />
						</linearGradient>
					</defs>

					<path
						d="M20 26H180"
						fill="none"
						stroke="var(--dry-color-stroke-weak)"
						stroke-width="1.5"
					/>
					<path
						d="M20 54H180"
						fill="none"
						stroke="var(--dry-color-stroke-weak)"
						stroke-width="1.5"
					/>
					<path
						d="M20 84H180"
						fill="none"
						stroke="var(--dry-color-stroke-weak)"
						stroke-width="1.5"
					/>
					<path
						d="M20 76C42 70 52 58 72 58C92 58 102 78 122 58C140 40 158 24 180 28L180 84L20 84Z"
						fill="url(#svg-chart-fill)"
					/>
					<path
						d="M20 76C42 70 52 58 72 58C92 58 102 78 122 58C140 40 158 24 180 28"
						fill="none"
						stroke="url(#svg-chart-line)"
						stroke-width="4"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<circle cx="72" cy="58" r="5" fill="var(--dry-color-fill-success)" />
					<circle cx="122" cy="58" r="5" fill="var(--dry-color-fill-info)" />
					<circle cx="180" cy="28" r="6" fill="var(--dry-color-fill-info)" />
					<circle cx="180" cy="28" r="2.5" fill="var(--dry-color-bg-base)" />
				</Svg>
			</div>
		</article>
	</div>
</div>

<style>
	.svg-demo,
	.svg-intro,
	.svg-grid,
	.demo-card,
	.demo-copy {
		display: grid;
	}

	.svg-demo {
		gap: var(--dry-space-6);
		container-type: inline-size;
	}

	.svg-intro {
		gap: var(--dry-space-2);
	}

	.svg-eyebrow,
	.demo-label {
		margin: 0;
		font-size: var(--dry-text-xs-size);
		line-height: var(--dry-text-xs-leading);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.svg-title,
	.svg-copy,
	.demo-description {
		margin: 0;
	}

	.svg-title {
		font-family: var(--dry-font-display);
		font-size: var(--dry-text-xl-size);
		line-height: var(--dry-text-xl-leading);
		color: var(--dry-color-text-strong);
	}

	.svg-copy {
		font-size: var(--dry-text-sm-size);
		line-height: var(--dry-text-sm-leading);
		color: var(--dry-color-text-weak);
	}

	.svg-title code {
		font-family: var(--dry-font-mono);
		font-size: 0.9em;
		color: var(--dry-color-text-brand);
	}

	.svg-grid {
		gap: var(--dry-space-4);
		grid-template-columns: minmax(0, 1fr);
	}

	.demo-card {
		gap: var(--dry-space-4);
		align-content: space-between;
		padding: var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-xl);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--tile-glow) 18%, transparent),
				color-mix(in srgb, var(--dry-color-bg-base) 94%, var(--tile-surface))
			),
			var(--dry-color-bg-base);
		/* dryui-allow inset-shadow: intentional top highlight rail on demo tile. */
		box-shadow: inset 0 1px 0 color-mix(in srgb, var(--dry-color-text-inverse) 10%, transparent);
	}

	.demo-card[data-tone='brand'] {
		--tile-surface: var(--dry-color-fill-brand-weak);
		--tile-glow: var(--dry-color-fill-brand);
	}

	.demo-card[data-tone='accent'] {
		--tile-surface: var(--dry-color-fill-accent-weak);
		--tile-glow: var(--dry-color-fill-accent);
	}

	.demo-card[data-tone='success'] {
		--tile-surface: var(--dry-color-fill-success-weak);
		--tile-glow: var(--dry-color-fill-success);
	}

	.demo-copy {
		gap: var(--dry-space-1_5);
	}

	.demo-description {
		font-size: var(--dry-text-sm-size);
		line-height: var(--dry-text-sm-leading);
		color: var(--dry-color-text-weak);
	}

	.svg-art {
		justify-self: start;
	}

	@container (min-width: 44rem) {
		.svg-grid {
			grid-template-columns: minmax(0, 1.3fr) minmax(0, 0.7fr);
		}

		.demo-card-feature {
			grid-row: 1 / span 2;
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			align-items: center;
		}

		.demo-card-feature .svg-art-feature {
			justify-self: end;
			align-self: center;
		}
	}
</style>
