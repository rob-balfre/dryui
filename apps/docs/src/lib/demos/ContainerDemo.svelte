<script lang="ts">
	import { Container, Heading } from '@dryui/ui';
</script>

<div class="viewport">
	<Container size="md">
		<article class="article">
			<p class="eyebrow">Engineering / April 24</p>
			<Heading level={3}>Why we replaced our grid library</Heading>
			<p>
				Our dashboard ran on a heavyweight grid helper that shipped 48 KB gzipped. After three years
				and six major versions, we only used three features: sortable columns, pagination, and a
				selection checkbox.
			</p>
			<p>
				Native HTML tables with CSS grid handle the layout. A small hook manages sort state. The
				selection checkbox is an existing component. Bundle size dropped by 41 KB, and the first
				paint on the accounts view fell from 820ms to 380ms on a mid-tier laptop.
			</p>
			<p>
				Container holds the measure at a readable width. The surrounding viewport is drawn at full
				width so you can see the clamp in context.
			</p>
		</article>
	</Container>
</div>

<style>
	.viewport {
		display: grid;
		padding: var(--dry-space-5) 0;
		background: repeating-linear-gradient(
			135deg,
			color-mix(in srgb, var(--dry-color-bg-raised) 80%, transparent),
			color-mix(in srgb, var(--dry-color-bg-raised) 80%, transparent) 8px,
			color-mix(in srgb, var(--dry-color-bg-base) 70%, transparent) 8px,
			color-mix(in srgb, var(--dry-color-bg-base) 70%, transparent) 16px
		);
		border-radius: var(--dry-radius-lg);
	}

	.article {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 94%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	p {
		margin: 0;
		line-height: 1.6;
		color: var(--dry-color-text-strong);
		max-inline-size: 62ch;
	}
</style>
