<script lang="ts">
	import { FileUpload } from '@dryui/ui';
</script>

<FileUpload.Root>
	<FileUpload.Dropzone>
		<p>Drop files here or</p>
		<FileUpload.Trigger>Browse files</FileUpload.Trigger>
	</FileUpload.Dropzone>
	<FileUpload.List>
		{#snippet children({ file, index })}
			<FileUpload.Item {file} {index}>
				<span>{file.name}</span>
				<FileUpload.ItemDelete {index}>Remove</FileUpload.ItemDelete>
			</FileUpload.Item>
		{/snippet}
	</FileUpload.List>
</FileUpload.Root>
