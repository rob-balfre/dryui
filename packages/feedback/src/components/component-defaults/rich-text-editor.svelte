<script lang="ts">
	import { RichTextEditor } from '@dryui/ui';

	let value = $state(
		`<p><strong>Update at 09:18 UTC.</strong> us-east-1 runner pool recovered. Promoting the hotfix to production now.</p>`
	);
</script>

<RichTextEditor.Root bind:value placeholder="Write an update...">
	<RichTextEditor.Toolbar />
	<RichTextEditor.Content />
</RichTextEditor.Root>
