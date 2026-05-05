<script lang="ts">
	import { ContextMenu } from '@dryui/ui';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		<div class="surface">Right-click here</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item>Open</ContextMenu.Item>
		<ContextMenu.Item>Copy</ContextMenu.Item>
		<ContextMenu.Separator />
		<ContextMenu.Item>Rename</ContextMenu.Item>
		<ContextMenu.Item>Delete</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>

<style>
	.surface {
		display: grid;
		place-items: center;
		padding: var(--dry-space-6);
		border-radius: var(--dry-radius-lg);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-weak);
	}
</style>
