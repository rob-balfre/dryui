<script lang="ts">
	import { CommandPalette } from '@dryui/ui';
</script>

<CommandPalette.Root open={true}>
	<CommandPalette.Input placeholder="Search commands..." />
	<CommandPalette.List>
		<CommandPalette.Group heading="Actions">
			<CommandPalette.Item value="new-project">New project</CommandPalette.Item>
			<CommandPalette.Item value="invite-member">Invite member</CommandPalette.Item>
			<CommandPalette.Item value="open-settings">Open settings</CommandPalette.Item>
		</CommandPalette.Group>
		<CommandPalette.Separator />
		<CommandPalette.Group heading="Navigation">
			<CommandPalette.Item value="go-dashboard">Go to dashboard</CommandPalette.Item>
			<CommandPalette.Item value="go-billing">Go to billing</CommandPalette.Item>
		</CommandPalette.Group>
		<CommandPalette.Empty>No matches found</CommandPalette.Empty>
	</CommandPalette.List>
</CommandPalette.Root>
