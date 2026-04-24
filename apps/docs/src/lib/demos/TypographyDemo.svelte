<script lang="ts">
	import { Typography } from '@dryui/ui';
</script>

<article class="article">
	<Typography.Text as="p" variant="label" size="xs">Engineering log</Typography.Text>
	<Typography.Heading level={2} variant="display" maxMeasure="narrow">
		Why we cut our bundle by 38% without removing a single feature.
	</Typography.Heading>
	<Typography.Text as="p" color="secondary" maxMeasure="default">
		We split the theme surface from behavioral primitives and let the bundler drop anything a route
		does not render. The result is a faster first paint and a smaller critical path.
	</Typography.Text>
	<Typography.Blockquote>
		Treat tokens as data. Treat components as functions. Ship only the ones you call.
	</Typography.Blockquote>
	<Typography.Text as="p" color="muted" size="sm">
		Excerpted from the 1.4 release notes. Full post at
		<Typography.Code>dryui.dev/changelog/1-4</Typography.Code>.
	</Typography.Text>
</article>

<style>
	.article {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-6);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-overlay) 52%, transparent),
			color-mix(in srgb, var(--dry-color-bg-base) 68%, transparent)
		);
	}
</style>
