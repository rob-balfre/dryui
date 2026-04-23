<script lang="ts">
	import { Badge, Enter, Text } from '@dryui/ui';
</script>

<Enter>
	<div class="motion-panel">
		<Badge variant="soft">Mounted</Badge>
		<Text weight="semibold">Entrance timing follows the theme motion tokens.</Text>
		<Text color="muted" size="sm">Use the index prop when coordinating multiple reveals.</Text>
	</div>
</Enter>

<style>
	.motion-panel {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-subtle);
		border-radius: var(--dry-radius-card);
	}
</style>
