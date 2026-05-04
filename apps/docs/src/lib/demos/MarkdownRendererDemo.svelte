<script lang="ts">
	import { MarkdownRenderer } from '@dryui/ui';

	const changelog = `# DryUI 1.4.0

Released **April 24, 2026**

## Highlights

- New \`DataGrid\` sorting API with \`sortable\` on any column
- \`MarkdownRenderer\` now handles GFM tables and task lists
- \`Pagination\` ships with keyboard-first navigation

## Breaking

1. \`Alert\` no longer accepts the \`tone\` prop. Use \`variant\`.
2. \`--dry-color-accent\` removed. Map to \`--dry-color-fill-brand\`.
3. \`Tree.Root\`'s \`expanded\` prop is now \`defaultExpanded\`.

## Fixes

- \`AlertDialog\` focus trap no longer leaks past the close button
- \`DatePicker\` parses \`YYYY-MM-DD\` reliably on Safari 17
- \`Tooltip\` respects \`prefers-reduced-motion\` when opening

## Example

\`\`\`svelte
<Pagination.Root bind:page totalPages={12}>
  <Pagination.Content>...</Pagination.Content>
</Pagination.Root>
\`\`\`

See the [migration guide](https://dryui.dev/migrate/1.4) for the full diff.`;
</script>

<MarkdownRenderer content={changelog} />
