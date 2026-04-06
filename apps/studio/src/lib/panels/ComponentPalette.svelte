<script lang="ts">
	import type { PaletteItem } from '../studio-data';
	import { Badge, Card, Input, Separator } from '@dryui/ui';
	import PaletteItemRow from './PaletteItem.svelte';

	interface Props {
		items: PaletteItem[];
		selectedId: string;
		onSelect: (item: PaletteItem) => void;
		onDragStart: (event: DragEvent, item: PaletteItem) => void;
	}

	let { items, selectedId, onSelect, onDragStart }: Props = $props();

	let query = $state('');

	const categories = $derived(Array.from(new Set(items.map((item) => item.category))).sort());

	const filteredGroups = $derived(
		categories
			.map((category) => {
				const categoryItems = items.filter((item) => item.category === category);
				const filteredItems = categoryItems.filter((item) => {
					const haystack = `${item.name} ${item.description} ${item.badge}`.toLowerCase();
					return haystack.includes(query.toLowerCase());
				});

				return {
					category,
					items: filteredItems
				};
			})
			.filter((group) => group.items.length > 0)
	);
</script>

<section class="panel">
	<Card.Root>
		<div class="panel-header">
			<Card.Header>
				<div class="header-copy">
					<Badge variant="outline" color="blue">Palette</Badge>
					<h2>Browse components</h2>
				</div>
				<p>Search the DryUI catalog, then insert a component tree directly into the canvas.</p>
			</Card.Header>
		</div>
		<div class="panel-body">
			<Card.Content>
				<Input
					bind:value={query}
					size="sm"
					placeholder="Search component, tag, or category"
					aria-label="Search components"
				/>

				<div class="group-stack">
					{#each filteredGroups as group (group.category)}
						<section class="group">
							<div class="group-title">
								<h3>{group.category}</h3>
								<span>{group.items.length}</span>
							</div>
							<div class="item-list">
								{#each group.items as item (item.id)}
									<PaletteItemRow
										{item}
										selected={selectedId === item.id}
										{onSelect}
										{onDragStart}
									/>
								{/each}
							</div>
						</section>
						<Separator />
					{/each}
				</div>
			</Card.Content>
		</div>
	</Card.Root>
</section>

<style>
	.panel {
		height: 100%;
	}

	.panel-header {
		display: grid;
		gap: var(--dry-space-2);
	}

	.header-copy {
		display: flex;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.header-copy h2,
	.group-title h3 {
		margin: 0;
	}

	.panel-header p {
		margin: 0;
		color: var(--dry-color-text-muted);
	}

	.panel-body {
		display: grid;
		gap: var(--dry-space-4);
	}

	.group-stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.group {
		display: grid;
		gap: var(--dry-space-3);
	}

	.group-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: var(--dry-color-text-muted);
		text-transform: capitalize;
		letter-spacing: 0.03em;
	}

	.group-title h3 {
		font-size: var(--dry-text-sm-size);
	}

	.item-list {
		display: grid;
		gap: var(--dry-space-2);
	}
</style>
