<script lang="ts">
	import { Badge, ContextMenu } from '@dryui/ui';

	const rows = [
		{ name: 'api-gateway', env: 'production', status: 'healthy' },
		{ name: 'billing-worker', env: 'production', status: 'healthy' },
		{ name: 'preview-bot', env: 'preview', status: 'degraded' }
	];
</script>

<div class="table">
	<p class="hint">Right-click a row</p>
	{#each rows as row (row.name)}
		<ContextMenu.Root>
			<ContextMenu.Trigger>
				<div class="row">
					<span class="name">{row.name}</span>
					<Badge variant="soft" size="sm" color={row.status === 'healthy' ? 'green' : 'orange'}
						>{row.status}</Badge
					>
					<span class="env">{row.env}</span>
				</div>
			</ContextMenu.Trigger>
			<ContextMenu.Content>
				<ContextMenu.Label>{row.name}</ContextMenu.Label>
				<ContextMenu.Item>Open in console</ContextMenu.Item>
				<ContextMenu.Item>Copy service URL</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item>Restart service</ContextMenu.Item>
				<ContextMenu.Item>Roll back to last deploy</ContextMenu.Item>
				<ContextMenu.Separator />
				<ContextMenu.Item>Delete</ContextMenu.Item>
			</ContextMenu.Content>
		</ContextMenu.Root>
	{/each}
</div>

<style>
	.table {
		display: grid;
		gap: var(--dry-space-1);
	}

	.hint {
		margin: 0 0 var(--dry-space-1);
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content max-content;
		align-items: center;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3) var(--dry-space-4);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-md);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 32%, transparent);
		font-size: var(--dry-text-sm-size);
	}

	.name {
		font-family: var(--dry-font-mono);
		color: var(--dry-color-text-strong);
	}

	.env {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}
</style>
