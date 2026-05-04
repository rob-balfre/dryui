<script lang="ts">
	import { Combobox, Field, Label } from '@dryui/ui';

	const repos = [
		{ value: 'acme/scratchpad-api', owner: 'acme' },
		{ value: 'acme/scratchpad-web', owner: 'acme' },
		{ value: 'acme/hooks-ingest', owner: 'acme' },
		{ value: 'dryui/ui', owner: 'dryui' },
		{ value: 'dryui/cli', owner: 'dryui' }
	];

	let repo = $state('dryui/ui');
	let query = $state('');

	const filteredRepos = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return repos;
		return repos.filter((r) => r.value.toLowerCase().includes(q));
	});
</script>

<div class="panel">
	<Field.Root>
		<Label>Deploy from repository</Label>
		<Combobox.Root bind:value={repo} name="repo">
			<Combobox.Input
				placeholder="Search repos by owner or name..."
				oninput={(e) => (query = (e.currentTarget as HTMLInputElement).value)}
			/>
			<Combobox.Content>
				{#each filteredRepos as item, index (item.value)}
					<Combobox.Item value={item.value} {index}>
						<span class="owner">{item.owner}/</span>{item.value.split('/')[1]}
					</Combobox.Item>
				{:else}
					<Combobox.Empty>No matching repositories.</Combobox.Empty>
				{/each}
			</Combobox.Content>
		</Combobox.Root>
		<Field.Description>
			{filteredRepos.length} of {repos.length} matches across 2 connected organizations.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
		max-inline-size: 28rem;
	}

	.owner {
		color: var(--dry-color-text-weak);
	}
</style>
