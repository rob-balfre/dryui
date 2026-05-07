<script lang="ts">
	import { Heading } from '@dryui/ui/heading';
	import { Text } from '@dryui/ui/text';
</script>

<svelte:head>
	<title>DryUI is wired up</title>
</svelte:head>

<main data-layout="home">
	<section data-layout-area="intro">
		<Text as="p" size="xs" font="mono" weight="bold" color="muted">DRYUI</Text>
		<Heading level={1} variant="display">DryUI is wired up.</Heading>
		<Text as="p" size="lg" color="muted">
			Reusable components, theme tokens, route patterns, and a lint preprocessor that keep your UI
			consistent as you and your agents iterate. Edit src/routes/+page.svelte to start building.
		</Text>
		<a class="docs-link" href="https://dryui.dev/getting-started">Read the docs &rarr;</a>
	</section>
</main>

<style>
	.docs-link {
		align-self: start;
		color: var(--dry-color-text-strong);
		font-weight: 600;
		text-decoration: none;
		border-bottom: 1px solid var(--dry-color-stroke-weak);
		padding-block-end: 0.15rem;
		transition: border-color 120ms ease;
	}

	.docs-link:hover,
	.docs-link:focus-visible {
		border-bottom-color: var(--dry-color-text-strong);
	}
</style>
