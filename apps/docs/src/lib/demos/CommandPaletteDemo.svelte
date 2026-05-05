<script lang="ts">
	import { Button, CommandPalette } from '@dryui/ui';

	let open = $state(false);
</script>

<Button variant="outline" onclick={() => (open = true)}>Open command palette</Button>

<CommandPalette.Root bind:open>
	<CommandPalette.Input placeholder="Search..." />
	<CommandPalette.List>
		<CommandPalette.Group heading="Actions">
			<CommandPalette.Item value="new">New</CommandPalette.Item>
			<CommandPalette.Item value="open">Open</CommandPalette.Item>
			<CommandPalette.Item value="settings">Settings</CommandPalette.Item>
		</CommandPalette.Group>
		<CommandPalette.Separator />
		<CommandPalette.Group heading="Navigate">
			<CommandPalette.Item value="home">Home</CommandPalette.Item>
			<CommandPalette.Item value="profile">Profile</CommandPalette.Item>
		</CommandPalette.Group>
	</CommandPalette.List>
</CommandPalette.Root>
