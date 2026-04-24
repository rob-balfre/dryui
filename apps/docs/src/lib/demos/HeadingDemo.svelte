<script lang="ts">
	import { Heading, Text } from '@dryui/ui';
</script>

<article class="release">
	<p class="eyebrow">Released April 22</p>
	<Heading level={2} variant="display" maxMeasure="narrow">
		1.4.0 ships tree-shakeable tokens and a new audit surface.
	</Heading>
	<Text color="secondary" size="sm" maxMeasure="default">
		Tokens now lazy-load per route, and every component emits a stable contract hash so breakage
		shows up in the check command instead of at runtime.
	</Text>
</article>

<style>
	.release {
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

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}
</style>
