<script lang="ts">
	import { DropdownMenu, Button } from '@dryui/ui';
</script>

<DropdownMenu.Root open={true}>
	<DropdownMenu.Trigger>
		<Button variant="outline">Member actions</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Label>Member actions</DropdownMenu.Label>
		<DropdownMenu.Group>
			<DropdownMenu.Item>View profile</DropdownMenu.Item>
			<DropdownMenu.Item>Change role</DropdownMenu.Item>
			<DropdownMenu.Item>Reset 2FA</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Suspend account</DropdownMenu.Item>
		<DropdownMenu.Item>Remove from workspace</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
