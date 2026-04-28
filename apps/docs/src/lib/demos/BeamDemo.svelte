<script lang="ts">
	import { Beam, Text } from '@dryui/ui';
</script>

<div class="stage">
	<div class="head">
		<p class="eyebrow">Deploy route</p>
		<h3 class="title">Replicating edge to region</h3>
		<Text color="secondary" size="sm">
			Beam draws a moving highlight across a surface. Use it to hint at an active path without
			adding a full particle system.
		</Text>
	</div>

	<div class="topology" role="figure" aria-label="Edge to region deploy path">
		<Beam width={42} intensity={92} speed={3.6} angle={0}>
			<div class="topology-inner">
				<div class="node node-edge">
					<span class="node-label">edge.syd</span>
					<span class="node-meta">Cloudflare POP</span>
				</div>

				<div class="trail" aria-hidden="true">
					<span class="pulse"></span>
				</div>

				<div class="node node-region">
					<span class="node-label">us-east-1</span>
					<span class="node-meta">Primary</span>
				</div>
			</div>
		</Beam>
	</div>

	<div class="grid">
		<article class="tile">
			<Beam color="var(--dry-color-fill-success)" angle={-30} width={30} intensity={86} speed={4.2}>
				<div class="tile-inner">
					<p class="tile-label">Build</p>
					<p class="tile-value">pass · 01:42</p>
				</div>
			</Beam>
		</article>

		<article class="tile">
			<Beam color="var(--dry-color-fill-warning)" angle={45} width={34} intensity={88} speed={3.2}>
				<div class="tile-inner">
					<p class="tile-label">Smoke</p>
					<p class="tile-value">1 flaky retry</p>
				</div>
			</Beam>
		</article>

		<article class="tile">
			<Beam color="var(--dry-color-fill-brand)" angle={90} width={48} intensity={82} speed={2.8}>
				<div class="tile-inner">
					<p class="tile-label">Rollout</p>
					<p class="tile-value">staged · 34%</p>
				</div>
			</Beam>
		</article>
	</div>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
		container-type: inline-size;
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

	.title {
		margin: 0;
		font-size: clamp(1.4rem, 2.2vw, 1.85rem);
		line-height: 1.15;
		color: var(--dry-color-text-strong);
	}

	.topology {
		display: grid;
		padding: 1px;
		border-radius: var(--dry-radius-xl);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 68%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 44%, transparent);
	}

	.topology-inner {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(3rem, 1.4fr) minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-5);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 64%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 78%, transparent)
		);
		border-radius: calc(var(--dry-radius-xl) - 1px);
	}

	.node {
		display: grid;
		gap: 0.15rem;
		padding: var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 72%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 76%, transparent);
	}

	.node-edge {
		border-color: color-mix(in srgb, var(--dry-color-fill-brand) 36%, var(--dry-color-stroke-weak));
	}

	.node-region {
		border-color: color-mix(
			in srgb,
			var(--dry-color-fill-success) 36%,
			var(--dry-color-stroke-weak)
		);
	}

	.node-label {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.node-meta {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.trail {
		position: relative;
		display: grid;
		align-items: center;
		block-size: 2px;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--dry-color-fill-brand) 58%, transparent) 30%,
			color-mix(in srgb, var(--dry-color-fill-success) 58%, transparent) 70%,
			transparent
		);
		border-radius: 2px;
	}

	.pulse {
		position: absolute;
		inset-block: -4px;
		padding-inline: 0.55rem;
		border-radius: 999px;
		background: radial-gradient(
			circle,
			color-mix(in srgb, var(--dry-color-fill-brand) 72%, white) 0%,
			transparent 70%
		);
		filter: blur(1px);
		animation: pulse-travel 2.4s ease-in-out infinite;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--dry-space-3);
	}

	.tile {
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
	}

	.tile-inner {
		display: grid;
		gap: 0.15rem;
		padding: var(--dry-space-4);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 78%, transparent);
	}

	.tile-label {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.tile-value {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	@keyframes pulse-travel {
		0% {
			inset-inline-start: -5%;
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		80% {
			opacity: 1;
		}
		100% {
			inset-inline-start: 100%;
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
			inset-inline-start: 50%;
			transform: translateX(-50%);
			opacity: 0.7;
		}
	}
</style>
