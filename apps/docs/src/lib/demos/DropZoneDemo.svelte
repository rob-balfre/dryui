<script lang="ts">
	import { DropZone } from '@dryui/ui';

	let lastDrop = $state<{ count: number; total: string } | null>(null);

	function handleDrop(files: File[]) {
		const bytes = files.reduce((sum, file) => sum + file.size, 0);
		const total =
			bytes > 1024 * 1024
				? `${(bytes / 1024 / 1024).toFixed(1)} MB`
				: `${(bytes / 1024).toFixed(1)} KB`;
		lastDrop = { count: files.length, total };
	}
</script>

<div class="panel">
	<div class="context">
		<p class="eyebrow">Bulk import</p>
		<p class="title">Drop screenshots to attach</p>
		<p class="note">
			PNG, JPG, or HEIC. Images are uploaded to the <code>incidents/INC-9841</code> bucket.
		</p>
	</div>

	<DropZone accept="image/*" onDrop={handleDrop}>
		Drop images here or paste from clipboard (Cmd+V).
	</DropZone>

	{#if lastDrop}
		<p class="meta">
			Queued {lastDrop.count} file{lastDrop.count === 1 ? '' : 's'}, {lastDrop.total} total.
		</p>
	{:else}
		<p class="meta">No files queued yet.</p>
	{/if}
</div>

<style>
	.panel {
		display: grid;
		gap: var(--dry-space-3);
	}

	.context {
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

	.note,
	.meta {
		margin: 0;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
		line-height: 1.5;
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
