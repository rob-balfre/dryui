<script>
	import { Drawer, Button } from '@dryui/ui';

	let drawerOpen = $state(false);
</script>

<Drawer.Root bind:open={drawerOpen}>
	<Drawer.Trigger><Button>Open Drawer</Button></Drawer.Trigger>
	<Drawer.Content side="right">
		<Drawer.Header>Settings</Drawer.Header>
		<p>Adjust your account preferences and notification settings here.</p>
	</Drawer.Content>
</Drawer.Root>
