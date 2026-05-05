<script lang="ts">
	import { Button, Drawer } from '@dryui/ui';
</script>

<Drawer.Root side="right">
	<Drawer.Trigger>
		<Button variant="outline">Open drawer</Button>
	</Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>Drawer title</Drawer.Header>
	</Drawer.Content>
</Drawer.Root>
