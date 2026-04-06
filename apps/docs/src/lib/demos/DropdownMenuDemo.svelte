<script>
	import { DropdownMenu, Button } from '@dryui/ui';
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger><Button variant="ghost">Menu</Button></DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item>Edit</DropdownMenu.Item>
		<DropdownMenu.Item>Duplicate</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item>Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
