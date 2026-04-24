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
</script>

<div class="stage">
	<div class="panel">
		<Field.Root>
			<Label>Deploy from repository</Label>
			<Combobox.Root bind:value={repo} name="repo">
				<Combobox.Input placeholder="Search repos by owner or name..." />
				<Combobox.Content>
					{#each repos as item, index (item.value)}
						<Combobox.Item value={item.value} {index}>
							<span class="owner">{item.owner}/</span>{item.value.split('/')[1]}
						</Combobox.Item>
					{/each}
					<Combobox.Empty>No matching repositories.</Combobox.Empty>
				</Combobox.Content>
			</Combobox.Root>
			<Field.Description>
				{repos.length} matches across 2 connected organizations.
			</Field.Description>
		</Field.Root>
	</div>

	<section class="preview" aria-label="Open combobox preview">
		<p class="eyebrow">Dropdown preview</p>
		<ul>
			{#each repos as item, index (item.value)}
				<li class="item" class:active={index === 3}>
					<span class="owner">{item.owner}/</span>{item.value.split('/')[1]}
				</li>
			{/each}
		</ul>
	</section>
</div>

<style>
	.stage {
		display: grid;
		gap: var(--dry-space-4);
	}
	.panel {
		display: grid;
	}
	.owner {
		color: var(--dry-color-text-weak);
	}

	.preview {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-3);
		max-inline-size: 28em;
		border-radius: var(--dry-radius-md);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 70%, transparent);
		box-shadow: 0 18px 40px color-mix(in srgb, var(--dry-color-shadow) 35%, transparent);
	}

	.eyebrow {
		margin: 0;
		padding: 0 var(--dry-space-2);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	ul {
		display: grid;
		gap: 2px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.item {
		padding: var(--dry-space-2) var(--dry-space-3);
		border-radius: var(--dry-radius-sm);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}

	.item.active {
		background: color-mix(in srgb, var(--dry-color-fill-brand) 16%, transparent);
	}
</style>
