<script lang="ts">
	import type { PageProps } from './$types';
	import { Badge, Card, CodeBlock, Container, Heading, Link, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import { toSlug } from '$lib/nav';
	import { withBase } from '$lib/utils';
	import MetaSeparator from '$lib/components/MetaSeparator.svelte';

	let { data }: PageProps = $props();
	let preset = $derived(data.preset);
</script>

<svelte:head>
	<title>{preset.name} — Layouts — dryui</title>
</svelte:head>

<Container>
	<div class="stack-xl">
		<div class="stack-md">
			<div class="flex-wrap-md">
				<Badge variant="soft" size="sm">Layout</Badge>
				<MetaSeparator />
				<div class="flex-wrap-sm">
					{#each preset.regions as region (region)}
						<Badge variant="outline" color="gray" size="sm">{region}</Badge>
					{/each}
				</div>
			</div>
			<Heading level={1}>{preset.name}</Heading>
			<Text size="lg" color="secondary">{preset.description}</Text>
		</div>

		<Card.Root>
			<Card.Header>
				<div class="stack-sm">
					<Heading level={3}>Quick start</Heading>
					<Text color="secondary">Copy this snippet to scaffold the layout.</Text>
				</div>
			</Card.Header>
			<Card.Content>
				<CodeBlock
					code={preset.snippet}
					language="svelte"
					showCopyButton={true}
					linkResolver={componentLinkResolver}
				/>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Heading level={3}>Components used</Heading>
			</Card.Header>
			<Card.Content>
				<div class="flex-wrap-sm">
					{#each preset.components as comp (comp)}
						<Link href={withBase(`/components/${toSlug(comp)}`)}
							><Badge variant="soft" size="sm">{comp}</Badge></Link
						>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</Container>

<style>
	.flex-wrap-md {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		align-items: center;
		gap: var(--dry-space-4);
	}
	.flex-wrap-sm {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}
</style>
