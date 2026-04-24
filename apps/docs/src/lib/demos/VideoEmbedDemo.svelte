<script lang="ts">
	import { Badge, Text, VideoEmbed } from '@dryui/ui';
</script>

<div class="stage">
	<div class="head">
		<div class="meta">
			<Badge variant="soft" color="purple">Product demo</Badge>
			<span class="meta-time">3:42</span>
		</div>
		<!-- dryui-allow raw-heading: docs demo content intentionally renders native headings. -->
		<h3 class="title">Scaffold a DryUI app in 90 seconds</h3>
		<Text color="secondary" size="sm">
			VideoEmbed lazy-loads the player on click. Poster art, aspect ratio, and provider handling are
			built in.
		</Text>
	</div>

	<div class="frame">
		<VideoEmbed
			src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
			provider="youtube"
			title="DryUI product walkthrough"
			aspectRatio="16/9"
		/>
	</div>

	<footer class="footer">
		<span class="dot" aria-hidden="true"></span>
		<Text color="secondary" size="sm">Player stays inert until the visitor hits play.</Text>
	</footer>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}

	.head {
		display: grid;
		gap: var(--dry-space-2);
	}

	.meta {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.meta-time {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: clamp(1.5rem, 2.4vw, 2rem);
		line-height: 1.15;
		color: var(--dry-color-text-strong);
	}

	.frame {
		overflow: hidden;
		border-radius: var(--dry-radius-xl);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-base) 92%, black);
	}

	.footer {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.dot {
		display: block;
		block-size: 0.5rem;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-fill-success);
	}
</style>
