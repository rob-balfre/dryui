<script lang="ts">
	import { FormatBytes } from '@dryui/ui';

	const uploads = [
		{ name: 'assets.zip', bytes: 980 },
		{ name: 'migration.sql', bytes: 1_458_000 },
		{ name: 'backup-2026-04-24.tar.gz', bytes: 24_800_000_000 },
		{ name: 'prod-metrics.parquet', bytes: 812_400_000 }
	];
</script>

<div class="card">
	<p class="eyebrow">Upload queue</p>
	<ul class="rows">
		{#each uploads as upload (upload.name)}
			<li class="row">
				<span class="file">{upload.name}</span>
				<span class="size"><FormatBytes value={upload.bytes} /></span>
			</li>
		{/each}
	</ul>
</div>

<style>
	.card {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4) var(--dry-space-5);
		border: 1px solid color-mix(in srgb, var(--dry-color-stroke-weak) 70%, transparent);
		border-radius: var(--dry-radius-lg);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 38%, transparent);
	}

	.eyebrow {
		margin: 0;
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-color-text-weak);
	}

	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--dry-space-2);
	}

	.row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: baseline;
		gap: var(--dry-space-3);
	}

	.file {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.size {
		font-variant-numeric: tabular-nums;
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
</style>
