<script lang="ts">
	import { FileUpload, Field, Label } from '@dryui/ui';

	function formatBytes(size: number) {
		if (size < 1024) return `${size} B`;
		if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
		return `${(size / 1024 / 1024).toFixed(1)} MB`;
	}
</script>

<div class="panel">
	<Field.Root>
		<Label>Import customers (CSV)</Label>
		<FileUpload.Root accept=".csv,text/csv" multiple maxSize={5 * 1024 * 1024}>
			<FileUpload.Dropzone>
				Drop your .csv here, or click to browse. Up to 5 MB each, 10 files per batch.
			</FileUpload.Dropzone>
			<FileUpload.List>
				{#snippet children({ file, index })}
					<FileUpload.Item {file} {index}>
						<span class="name">{file.name}</span>
						<span class="size">{formatBytes(file.size)}</span>
						<FileUpload.ItemDelete {index}>Remove</FileUpload.ItemDelete>
					</FileUpload.Item>
				{/snippet}
			</FileUpload.List>
		</FileUpload.Root>
		<Field.Description>
			Columns must match <code>email,first_name,last_name,plan</code>. Download the
			<a href="#template">template</a>.
		</Field.Description>
	</Field.Root>
</div>

<style>
	.panel {
		display: grid;
	}

	.name {
		color: var(--dry-color-text-strong);
		font-size: var(--dry-text-sm-size);
	}

	.size {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-weak);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}

	a {
		color: var(--dry-color-fill-brand);
	}
</style>
