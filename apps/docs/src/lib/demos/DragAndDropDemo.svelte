<script lang="ts">
	import { Badge, DragAndDrop } from '@dryui/ui';

	let columns = $state([
		{ id: 'name', label: 'Name', kind: 'string' },
		{ id: 'status', label: 'Status', kind: 'enum' },
		{ id: 'owner', label: 'Owner', kind: 'user' },
		{ id: 'env', label: 'Environment', kind: 'enum' },
		{ id: 'updated', label: 'Last updated', kind: 'date' }
	]);
</script>

<div class="stack">
	<div class="head">
		<p class="eyebrow">Deploys table</p>
		<p class="title">Column order</p>
		<p class="note">
			Drag the handle or press Space + arrows to reorder. Changes persist per user.
		</p>
	</div>

	<DragAndDrop.Root items={columns} onReorder={(next) => (columns = next)}>
		{#each columns as col, i (col.id)}
			<DragAndDrop.Item index={i}>
				<DragAndDrop.Handle index={i} />
				<span class="col-label">{col.label}</span>
				<Badge variant="soft" size="sm">{col.kind}</Badge>
			</DragAndDrop.Item>
		{/each}
	</DragAndDrop.Root>
</div>

<style>
	.stack {
		display: grid;
		gap: var(--dry-space-3);
		--dry-dnd-item-columns: auto minmax(0, 1fr) max-content;
		--dry-dnd-item-padding: var(--dry-space-3) var(--dry-space-4);
	}

	.head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.title {
		margin: 0;
		font-size: var(--dry-text-base-size);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.note {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	.col-label {
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
