<script lang="ts">
	import { FileSelect, Field, Label } from '@dryui/ui';
</script>

<div class="form">
	<Field.Root>
		<Label>Project root</Label>
		<FileSelect.Root value="/Users/rob/code/scratchpad-api">
			<FileSelect.Trigger>Choose folder</FileSelect.Trigger>
			<FileSelect.Value placeholder="No folder selected" />
			<FileSelect.Clear>Clear</FileSelect.Clear>
		</FileSelect.Root>
		<Field.Description>
			We watch this folder for <code>package.json</code> changes during dev.
		</Field.Description>
	</Field.Root>

	<Field.Root>
		<Label>TLS certificate</Label>
		<FileSelect.Root>
			<FileSelect.Trigger size="sm">Select .pem</FileSelect.Trigger>
			<FileSelect.Value placeholder="No certificate uploaded" />
			<FileSelect.Clear>Clear</FileSelect.Clear>
		</FileSelect.Root>
	</Field.Root>
</div>

<style>
	.form {
		display: grid;
		gap: var(--dry-space-4);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-xs-size);
		color: var(--dry-color-text-strong);
	}
</style>
