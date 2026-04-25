<script lang="ts">
	import { ContextMenu } from '@dryui/ui';
</script>

<ContextMenu.Root open={true}>
	<ContextMenu.Trigger>Right-click for actions</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Label>Item actions</ContextMenu.Label>
		<ContextMenu.Group>
			<ContextMenu.Item>Open</ContextMenu.Item>
			<ContextMenu.Item>Rename</ContextMenu.Item>
			<ContextMenu.Item>Duplicate</ContextMenu.Item>
		</ContextMenu.Group>
		<ContextMenu.Separator />
		<ContextMenu.Item>Move to trash</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>
