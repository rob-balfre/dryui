<script lang="ts">
	import { Badge, Button, Card, CodeBlock, Heading, Link, Text } from '@dryui/ui';
	import { componentLinkResolver } from '$lib/component-links';
	import { getComponentItem, toSlug } from '$lib/nav';
	import { withBase } from '$lib/utils';
	import DocsCallout from '$lib/components/DocsCallout.svelte';

	interface RelatedAlternative {
		rank: number;
		component: string;
		useWhen: string;
		snippet: string;
	}

	interface RelatedAntiPattern {
		pattern: string;
		reason: string;
		fix: string;
	}

	interface RelatedComposition {
		component: string;
		useWhen: string;
		alternatives: RelatedAlternative[];
		antiPatterns: RelatedAntiPattern[];
		combinesWith: string[];
	}

	interface Props {
		related: RelatedComposition;
	}

	let { related }: Props = $props();

	function hrefFor(name: string): string | null {
		const item = getComponentItem(name);
		return item ? withBase(`/components/${toSlug(item.name)}`) : null;
	}
</script>

<div class="related-layout">
	<div>
		<Heading level={2} id="related-components">Related Components</Heading>
		<Text color="secondary">
			Composition guidance pulled from the DryUI spec so you can compare nearby building blocks
			before committing to a pattern.
		</Text>
	</div>

	{#if related.alternatives.length > 0}
		<div class="alternatives-grid">
			{#each related.alternatives as alternative (`${alternative.rank}-${alternative.component}`)}
				<Card.Root>
					<Card.Header>
						<div class="alternative-header">
							<div class="alternative-badge">
								<Badge variant="soft" color="gray" size="sm">Alternative {alternative.rank}</Badge>
							</div>
							{#if hrefFor(alternative.component)}
								<Link href={hrefFor(alternative.component) ?? undefined} underline="always"
									>{alternative.component}</Link
								>
							{:else}
								<Heading level={3}>{alternative.component}</Heading>
							{/if}
							<Text color="secondary">{alternative.useWhen}</Text>
						</div>
					</Card.Header>
					<Card.Content>
						<CodeBlock
							code={alternative.snippet}
							language="svelte"
							linkResolver={componentLinkResolver}
						/>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if related.combinesWith.length > 0}
		<Card.Root>
			<Card.Header>
				<Heading level={3}>Combines With</Heading>
			</Card.Header>
			<Card.Content>
				<div class="combines-row">
					{#each related.combinesWith as name (name)}
						{@const href = hrefFor(name)}
						{#if href}
							<Button variant="soft" size="md" {href}>{name}</Button>
						{:else}
							<Badge variant="outline" color="gray" size="sm">{name}</Badge>
						{/if}
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	{#if related.antiPatterns.length > 0}
		<div class="anti-patterns-grid">
			{#each related.antiPatterns as antiPattern (`${antiPattern.pattern}-${antiPattern.fix}`)}
				<DocsCallout variant="warning">
					<div class="stack-sm">
						<Badge variant="outline" color="orange" size="sm">Avoid</Badge>
						<Text><code>{antiPattern.pattern}</code></Text>
						<Text color="secondary">{antiPattern.reason}</Text>
						<Text>
							Use
							{#if hrefFor(antiPattern.fix)}
								<Link href={hrefFor(antiPattern.fix) ?? undefined} underline="always"
									>{antiPattern.fix}</Link
								>
							{:else}
								<code>{antiPattern.fix}</code>
							{/if}
							instead.
						</Text>
					</div>
				</DocsCallout>
			{/each}
		</div>
	{/if}
</div>

<style>
	.related-layout {
		display: grid;
		gap: var(--dry-space-6);
	}

	.alternatives-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: var(--dry-space-4);
	}

	.alternative-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.combines-row {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}

	.anti-patterns-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
		gap: var(--dry-space-4);
	}
</style>
