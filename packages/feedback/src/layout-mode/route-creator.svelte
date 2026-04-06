<script lang="ts">
	import { CommandPalette, Badge, Text } from '@dryui/ui';
	import { compositionRecipes } from '@dryui/mcp/composition-data';

	interface Props {
		open: boolean;
		onCreate: (routePath: string, recipeName: string | null) => void;
		onClose: () => void;
	}

	let { open = $bindable(false), onCreate, onClose }: Props = $props();

	let routePath = $state('');

	const isRoute = $derived(routePath.startsWith('/'));

	function handleInput(e: Event) {
		routePath = (e.target as HTMLInputElement).value;
	}
</script>

<CommandPalette.Root bind:open onclose={onClose}>
	<CommandPalette.Input
		placeholder="Type route path, e.g. /dashboard/settings"
		oninput={handleInput}
	/>
	<CommandPalette.List>
		<CommandPalette.Empty>No matching recipes found.</CommandPalette.Empty>
		<CommandPalette.Group heading="Options">
			{#if isRoute}
				<CommandPalette.Item
					value="blank {routePath}"
					onSelect={() => {
						onCreate(routePath, null);
						open = false;
					}}
				>
					<div class="hstack-sm">
						<Text weight="semibold" size="sm">Blank canvas</Text>
						<Badge variant="outline" size="sm">{routePath}</Badge>
					</div>
				</CommandPalette.Item>
			{/if}

			{#each compositionRecipes as recipe (recipe.name)}
				<CommandPalette.Item
					value="{recipe.name} {recipe.description} {recipe.tags.join(' ')}"
					onSelect={() => {
						onCreate(routePath || '/new-page', recipe.name);
						open = false;
					}}
				>
					<div class="vstack-sm">
						<Text weight="semibold" size="sm">{recipe.name}</Text>
						{#if recipe.description}
							<Text size="xs" color="secondary">{recipe.description}</Text>
						{/if}
						{#if recipe.components.length > 0}
							<div class="flex-wrap-sm">
								{#each recipe.components.slice(0, 5) as component (component)}
									<Badge variant="soft" size="sm">{component}</Badge>
								{/each}
							</div>
						{/if}
					</div>
				</CommandPalette.Item>
			{/each}
		</CommandPalette.Group>
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

	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.flex-wrap-sm {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(0, max-content));
		gap: var(--dry-space-2, 0.5rem);
	}
</style>
