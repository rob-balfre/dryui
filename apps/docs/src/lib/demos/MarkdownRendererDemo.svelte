<script lang="ts">
	import { MarkdownRenderer } from '@dryui/ui';

	const content = `## Release notes

**Bold** and *italic* text with a [link](https://example.com).

- First item
- Second item
- Third item`;
</script>

<MarkdownRenderer {content} />
