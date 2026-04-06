<script lang="ts">
	import { Menubar } from '@dryui/ui';
</script>

<Menubar.Root>
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>New</Menubar.Item>
			<Menubar.Item>Open</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>Save</Menubar.Item>
			<Menubar.Item>Save As</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Undo</Menubar.Item>
			<Menubar.Item>Redo</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>Cut</Menubar.Item>
			<Menubar.Item>Copy</Menubar.Item>
			<Menubar.Item>Paste</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Zoom In</Menubar.Item>
			<Menubar.Item>Zoom Out</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>Full Screen</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
