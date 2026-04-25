<script lang="ts">
	import { AlertDialog, Button } from '@dryui/ui';
</script>

<AlertDialog.Root open={true}>
	<AlertDialog.Trigger>
		<Button variant="outline">Delete project</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Overlay />
	<AlertDialog.Content>
		<AlertDialog.Header>Delete this project?</AlertDialog.Header>
		<AlertDialog.Body>
			This action cannot be undone. The project and all of its history will be permanently removed.
		</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action>Delete project</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
