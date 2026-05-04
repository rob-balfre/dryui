<script lang="ts">
	import { Badge, GodRays, Text } from '@dryui/ui';
</script>

<div class="stage">
	<div class="scene">
		<GodRays
			rayCount={18}
			intensity={78}
			speed={34}
			center={{ x: 0.22, y: 0.02 }}
			color="color-mix(in srgb, var(--dry-color-fill-brand) 42%, transparent)"
			blendMode="screen"
			style="min-block-size: 22rem; border-radius: inherit;"
		>
			<div class="content">
				<div class="copy">
					<p class="eyebrow">Launch window</p>
					<h3 class="title">Canary rollout holding steady</h3>
					<Text color="secondary" size="sm">
						Rays sit inside the same surface as the content, so the highlight can follow a hero,
						panel, or status moment without another wrapper.
					</Text>
				</div>

				<div class="metrics" aria-label="Rollout status">
					<div class="metric">
						<span class="value">18%</span>
						<span class="label">traffic</span>
					</div>
					<div class="metric">
						<span class="value">0</span>
						<span class="label">errors</span>
					</div>
					<Badge variant="soft" color="green" pulse>Live</Badge>
				</div>
			</div>
		</GodRays>
	</div>
</div>

<style>
	.stage {
		display: grid;
		container-type: inline-size;
	}

	.scene {
		min-block-size: 22rem;
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-xl);
		background:
			radial-gradient(
				circle at 18% 0%,
				color-mix(in srgb, var(--dry-color-fill-brand) 18%, transparent),
				transparent 34%
			),
			linear-gradient(
				135deg,
				color-mix(in srgb, var(--dry-color-bg-raised) 92%, var(--dry-color-text-strong) 8%),
				color-mix(in srgb, var(--dry-color-bg-base) 88%, black 12%)
			);
		box-shadow: var(--dry-shadow-sm);
	}

	.content {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: end;
		gap: var(--dry-space-6);
		min-block-size: 22rem;
		padding: var(--dry-space-6);
	}

	.copy {
		display: grid;
		gap: var(--dry-space-2);
		max-inline-size: 34rem;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		max-inline-size: 12ch;
		font-size: clamp(2rem, 9cqi, 4.5rem);
		line-height: 0.95;
		color: var(--dry-color-text-strong);
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 6rem));
		align-items: end;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 62%, transparent);
		backdrop-filter: blur(16px);
	}

	.metric {
		display: grid;
		gap: 0.15rem;
	}

	.value {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xl-size);
		line-height: var(--dry-text-xl-line-height);
		color: var(--dry-color-text-strong);
	}

	.label {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	@container (max-width: 42rem) {
		.content {
			grid-template-columns: 1fr;
			align-items: end;
			padding: var(--dry-space-5);
		}

		.metrics {
			justify-self: start;
		}
	}
</style>
