<script lang="ts">
	import { Menubar } from '../../../packages/primitives/src/menubar/index.js';
</script>

<Menubar.Root>
	<Menubar.Menu>
		<Menubar.Trigger>File</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>New File</Menubar.Item>
			<Menubar.Item>Open</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger>Edit</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Undo</Menubar.Item>
			<Menubar.Item>Redo</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>

	<Menubar.Menu>
		<Menubar.Trigger>View</Menubar.Trigger>
		<Menubar.Content>
			<Menubar.Item>Zoom In</Menubar.Item>
			<Menubar.Item>Zoom Out</Menubar.Item>
		</Menubar.Content>
	</Menubar.Menu>
</Menubar.Root>
