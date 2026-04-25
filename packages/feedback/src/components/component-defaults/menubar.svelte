<script lang="ts">
	import { Menubar } from '@dryui/ui';
</script>

<Menubar.Root>
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>New file</Menubar.Item>
			<Menubar.Item>Open</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Item>Save</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Undo</Menubar.Item>
			<Menubar.Item>Redo</Menubar.Item>
			<Menubar.Separator />
			<Menubar.Label>Find</Menubar.Label>
			<Menubar.Item>Search workspace</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
	<Menubar.Menu>
		<Menubar.Trigger>View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Toggle sidebar</Menubar.Item>
			<Menubar.Item>Zen mode</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
