<script lang="ts">
	import { Button, DropdownMenu } from '@dryui/ui';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<Button variant="outline">Open menu</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content placement="bottom-start">
		<DropdownMenu.Label>Actions</DropdownMenu.Label>
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
