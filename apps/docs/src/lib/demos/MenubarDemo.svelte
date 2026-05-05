<script lang="ts">
	import { Menubar } from '@dryui/ui';
</script>

<Menubar.Root>
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>New</Menubar.Item>
			<Menubar.Item>Open</Menubar.Item>
			<Menubar.Item>Save</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Undo</Menubar.Item>
			<Menubar.Item disabled>Redo</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Toggle sidebar</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
