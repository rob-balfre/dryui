<script lang="ts">
	import { Drawer, Button } from '@dryui/ui';
</script>

<Drawer.Root open={true} side="right">
	<Drawer.Trigger>
		<Button variant="outline">Open settings</Button>
	</Drawer.Trigger>
	<Drawer.Overlay />
	<Drawer.Content>
		<Drawer.Header>Workspace settings</Drawer.Header>
		<Drawer.Body>
			<p>Manage notifications, privacy, and access for this workspace.</p>
		</Drawer.Body>
		<Drawer.Footer>
			<Drawer.Close>Cancel</Drawer.Close>
			<Button>Save changes</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>
