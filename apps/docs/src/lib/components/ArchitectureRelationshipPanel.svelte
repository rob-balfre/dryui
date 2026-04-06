<script lang="ts">
	import { Badge, Button, Card, Heading, Text } from '@dryui/ui';
	import type { ArchitectureFocusData } from '$lib/architecture';
	import { withBase } from '$lib/utils';

	interface Props {
		focus: ArchitectureFocusData;
		title?: string;
		id?: string;
	}

	let {
		focus,
		title = 'Architecture relationships',
		id = 'architecture-relationships'
	}: Props = $props();
</script>

<Card.Root>
	<Card.Header>
		<div class="panel-header">
			<Badge variant="outline" color="blue" size="sm">System view</Badge>
			<Heading level={2} {id}>{title}</Heading>
			<Text color="secondary">{focus.summary}</Text>
		</div>
	</Card.Header>
	<Card.Content>
		<div class="groups-grid">
			{#each focus.groups as group (group.id)}
				<section class="group-card">
					<div class="group-content">
						<div>
							<Heading level={3}>{group.title}</Heading>
							<Text size="sm" color="secondary">{group.description}</Text>
						</div>

						<div class="group-items">
							{#each group.items as item (item.id)}
								{#if item.href}
									<Button variant="soft" size="md" href={withBase(item.href)}>{item.label}</Button>
								{:else}
									<Badge variant="soft" color="gray" size="sm">{item.label}</Badge>
								{/if}
							{/each}
						</div>
					</div>
				</section>
			{/each}
		</div>
	</Card.Content>
</Card.Root>

<style>
	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.groups-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
		gap: var(--dry-space-4);
	}

	.group-card {
		padding: var(--dry-space-4);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--dry-color-bg-raised) 95%, transparent),
			var(--dry-color-bg-base)
		);
	}

	.group-content {
		display: grid;
		gap: var(--dry-space-2);
	}

	.group-items {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
