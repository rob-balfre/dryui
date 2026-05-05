<script lang="ts">
	import { RichTextEditor } from '@dryui/ui';

	let value = $state('<p>Start typing...</p>');
</script>

<RichTextEditor.Root bind:value placeholder="Write something...">
	<RichTextEditor.Toolbar>
		{#snippet children()}{/snippet}
	</RichTextEditor.Toolbar>
	<RichTextEditor.Content />
</RichTextEditor.Root>
