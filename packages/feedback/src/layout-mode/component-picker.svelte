<script lang="ts">
	import { CommandPalette, Text } from '@dryui/ui';
	import { thumbnailMap } from '@dryui/ui/thumbnail';
	import { loadCatalog } from './catalog.js';
	import type { CatalogEntry } from './types.js';

	interface Props {
		open: boolean;
		filter?: string;
		onSelect: (entry: CatalogEntry) => void;
		onClose: () => void;
	}

	let { open = $bindable(false), filter = '', onSelect, onClose }: Props = $props();

	let catalog: CatalogEntry[] = $state([]);

	$effect(() => {
		loadCatalog()
			.then((c) => {
				catalog = c;
			})
			.catch(() => {});
	});

	const grouped = $derived(
		catalog.reduce<Record<string, CatalogEntry[]>>((acc, entry) => {
			const key = entry.category || 'Other';
			(acc[key] ??= []).push(entry);
			return acc;
		}, {})
	);

	function itemValue(entry: CatalogEntry): string {
		return [entry.name, entry.description, ...entry.tags, entry.category].join(' ');
	}
</script>

<CommandPalette.Root bind:open onclose={onClose}>
	<CommandPalette.Input placeholder="Search components..." value={filter || undefined} />
	<CommandPalette.List>
		<CommandPalette.Empty>No components found.</CommandPalette.Empty>
		{#each Object.entries(grouped) as [category, entries]}
			<CommandPalette.Group heading={category}>
				{#each entries as entry (entry.name)}
					<CommandPalette.Item
						value={itemValue(entry)}
						onSelect={() => {
							onSelect(entry);
							open = false;
						}}
					>
						<div class="hstack-sm">
							{#if thumbnailMap[entry.name]}
								{@const Thumb = thumbnailMap[entry.name]}
								<div class="thumb-wrap">
									<svelte:component this={Thumb} size="sm" />
								</div>
							{/if}
							<div class="vstack">
								<Text weight="semibold" size="sm">{entry.name}</Text>
								{#if entry.description}
									<Text size="xs" color="secondary">{entry.description}</Text>
								{/if}
							</div>
						</div>
					</CommandPalette.Item>
				{/each}
			</CommandPalette.Group>
		{/each}
	</CommandPalette.List>
</CommandPalette.Root>

<style>
	.hstack-sm {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.vstack {
		display: grid;
	}

	.thumb-wrap {
		aspect-ratio: 1;
		height: 32px;
		flex-shrink: 0;
		overflow: hidden;
		border-radius: var(--dry-radius-sm);
	}
</style>
