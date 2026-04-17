<script lang="ts">
	import { Separator, Heading, Text, Badge } from '@dryui/ui';
	import DocsDemo from '$lib/components/DocsDemo.svelte';
</script>

<DocsDemo>
	<section class="section">
		<Heading level={4}>DryUI Components</Heading>
		<Text color="secondary">Zero-dependency Svelte 5 primitives built on native browser APIs.</Text>
	</section>

	<Separator />

	<section class="section">
		<Heading level={4}>Strong variant</Heading>
		<Text color="secondary"
			>Use <code>variant="strong"</code> for more prominent visual separation.</Text
		>
	</section>

	<Separator variant="strong" />

	<section class="section">
		<div class="inline-row">
			<Badge variant="soft" color="gray">v0.0.1</Badge>
			<Separator orientation="vertical" />
			<Badge variant="soft">Stable</Badge>
			<Separator orientation="vertical" />
			<Badge variant="soft" color="green">MIT</Badge>
		</div>
	</section>
</DocsDemo>

<style>
	.section {
		display: grid;
		gap: var(--dry-space-2);
	}

	code {
		font-size: var(--dry-text-sm-size);
	}

	.inline-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-3);
		min-height: var(--dry-space-8);
	}
</style>
