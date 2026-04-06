<script>
	import { ContextMenu } from '@dryui/ui';
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		<div class="trigger-area">Right-click here</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item>Edit</ContextMenu.Item>
		<ContextMenu.Item>Duplicate</ContextMenu.Item>
		<ContextMenu.Separator />
		<ContextMenu.Item>Delete</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>

<style>
	.trigger-area {
		padding: var(--dry-space-8);
		border: 1px dashed var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
		text-align: center;
	}
</style>
