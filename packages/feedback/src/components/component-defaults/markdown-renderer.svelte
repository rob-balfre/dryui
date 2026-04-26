<script lang="ts">
	import { MarkdownRenderer } from '@dryui/ui';

	const content = `## Markdown preview\n\nDryUI renders **inline emphasis**, lists, and \`code\` snippets.\n\n- First item\n- Second item`;
</script>

<MarkdownRenderer {content} />
