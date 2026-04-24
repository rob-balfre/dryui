<script lang="ts">
	import { Displacement, Badge } from '@dryui/ui';
</script>

<div class="stage">
	<header class="head">
		<div>
			<p class="eyebrow">Feature image</p>
			<p class="title">Organic turbulence, not CSS transform</p>
		</div>
		<Badge variant="soft" size="sm">Effect applied</Badge>
	</header>

	<div class="frame">
		<Displacement scale={22} turbulence="medium" animated>
			<div class="artwork" aria-hidden="true">
				<div class="band band-warm"></div>
				<div class="band band-cool"></div>
				<div class="band band-violet"></div>
				<div class="orb"></div>
				<p class="caption">scale 22 . medium turbulence . animated</p>
			</div>
		</Displacement>
	</div>

	<p class="note">
		Wraps any subtree with an SVG turbulence filter. Great for hero tiles that need a little liquid
		motion without swapping assets.
	</p>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
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
		font-size: var(--dry-text-lg-size);
		font-weight: 600;
		line-height: 1.2;
		color: var(--dry-color-text-strong);
	}

	.frame {
		overflow: hidden;
		border-radius: var(--dry-radius-xl);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		aspect-ratio: 16 / 9;
	}

	.artwork {
		position: relative;
		display: grid;
		align-items: end;
		min-block-size: 100%;
		overflow: hidden;
		padding: var(--dry-space-4);
		background:
			radial-gradient(ellipse 70% 80% at 30% 30%, rgba(251, 146, 60, 0.62) 0%, transparent 60%),
			radial-gradient(ellipse 70% 60% at 78% 70%, rgba(56, 189, 248, 0.58) 0%, transparent 60%),
			linear-gradient(
				145deg,
				color-mix(in srgb, var(--dry-color-bg-base) 70%, black),
				color-mix(in srgb, var(--dry-color-bg-base) 88%, var(--dry-color-fill-brand))
			);
	}

	.band {
		position: absolute;
		inset-inline: -10%;
		block-size: 24%;
		mix-blend-mode: screen;
		filter: blur(28px);
	}

	.band-warm {
		top: 16%;
		background: linear-gradient(90deg, rgba(250, 204, 21, 0.7), rgba(244, 114, 182, 0.7));
	}
	.band-cool {
		top: 46%;
		background: linear-gradient(90deg, rgba(14, 165, 233, 0.6), rgba(34, 197, 94, 0.6));
	}
	.band-violet {
		top: 72%;
		background: linear-gradient(90deg, rgba(167, 139, 250, 0.72), rgba(59, 130, 246, 0.72));
	}

	.orb {
		position: absolute;
		inset-block-start: 20%;
		inset-inline-start: 58%;
		block-size: 48%;
		aspect-ratio: 1;
		border-radius: 999px;
		background: radial-gradient(
			circle,
			rgba(255, 250, 240, 0.95) 0%,
			rgba(255, 223, 160, 0.5) 40%,
			transparent 70%
		);
		filter: blur(2px);
	}

	.caption {
		position: relative;
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: rgba(255, 255, 255, 0.85);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.6;
	}
</style>
