<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@dryui/ui/button';
	import { CommandPalette } from '@dryui/ui/command-palette';
	import { Hotkey } from '@dryui/ui/hotkey';
	import { Kbd } from '@dryui/ui/kbd';
	import { Text } from '@dryui/ui/text';
	import { getSearchSections } from '$lib/search';
	import { withBase } from '$lib/utils';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();

	let open = $state(false);
	const sections = getSearchSections();

	function buildValue(label: string, description: string, keywords: string[]): string {
		return [label, description, ...keywords].join(' ');
	}

	function openPalette(): void {
		open = true;
	}

	async function navigateTo(href: string): Promise<void> {
		open = false;
		await goto(withBase(href));
	}
</script>

<Hotkey keys="cmd+k" handler={openPalette} preventDefault />
<Hotkey keys="ctrl+k" handler={openPalette} preventDefault />

<div class={['search-trigger', !compact && 'search-trigger-full']}>
	<Button
		variant="outline"
		size={compact ? 'sm' : 'md'}
		onclick={openPalette}
		aria-label="Search docs"
	>
		<span class="search-inner">
			<svg
				class="search-icon"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="8" />
				<path d="m21 21-4.3-4.3" />
			</svg>
			<span class="search-label">Search docs</span>
			<span class="search-shortcut" aria-hidden="true">
				<Kbd keys={['⌘', 'K']} />
			</span>
		</span>
	</Button>
</div>

<div class="search-palette">
	<CommandPalette.Root bind:open>
		<CommandPalette.Input placeholder="Search components, templates, and docs..." />
		<CommandPalette.List>
			<CommandPalette.Empty>No matching docs routes found.</CommandPalette.Empty>
			{#each sections as section (section.heading)}
				<CommandPalette.Group heading={section.heading}>
					{#each section.items as item (item.href)}
						<CommandPalette.Item
							value={buildValue(item.label, item.description, item.keywords)}
							onSelect={() => void navigateTo(item.href)}
						>
							<div class="search-item">
								<Text as="span" weight="semibold">{item.label}</Text>
								<span class="search-item-description">
									<Text as="span" color="secondary" size="xs">
										{item.description}
									</Text>
								</span>
							</div>
						</CommandPalette.Item>
					{/each}
				</CommandPalette.Group>
			{/each}
		</CommandPalette.List>
	</CommandPalette.Root>
</div>

<style>
	.search-trigger {
		container-type: inline-size;
	}

	.search-trigger-full {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.search-inner {
		display: grid;
		grid-template-columns: auto;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.search-trigger-full .search-inner {
		justify-self: stretch;
	}

	.search-icon {
		display: block;
		flex-shrink: 0;
	}

	.search-label {
		display: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		text-align: start;
	}

	.search-shortcut {
		display: none;
		grid-auto-flow: column;
	}

	.search-palette {
		--dry-cmd-max-width: min(44rem, calc(100vw - 2rem));
	}

	.search-item {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-0_5);
	}

	.search-item-description {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	@media (min-width: 60rem) {
		.search-inner {
			grid-template-columns: auto minmax(0, 1fr) auto;
		}

		.search-label {
			display: block;
		}

		.search-shortcut {
			display: inline-grid;
		}
	}
</style>
