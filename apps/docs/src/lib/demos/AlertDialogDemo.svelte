<script lang="ts">
	import { AlertDialog, Button } from '@dryui/ui';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		<Button variant="solid" color="danger">Delete project</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>Delete project?</AlertDialog.Header>
		<AlertDialog.Body>
			This action cannot be undone. The project and all of its data will be permanently removed.
		</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Delete</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
