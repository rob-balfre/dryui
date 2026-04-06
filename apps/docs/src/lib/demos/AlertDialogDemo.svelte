<script lang="ts">
	import { AlertDialog, Button } from '@dryui/ui';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger><Button>Delete item</Button></AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>Are you sure?</AlertDialog.Header>
		<AlertDialog.Body
			>This action cannot be undone. The item and all associated data will be permanently removed.</AlertDialog.Body
		>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
