<script lang="ts">
	import { Dialog, Button } from '@dryui/ui';
</script>

<Dialog.Root open={true}>
	<Dialog.Trigger>
		<Button variant="outline">Edit profile</Button>
	</Dialog.Trigger>
	<Dialog.Overlay />
	<Dialog.Content>
		<Dialog.Header>Edit profile</Dialog.Header>
		<Dialog.Body>
			Update your display name and contact details. Changes apply across every workspace.
		</Dialog.Body>
		<Dialog.Footer>
			<Dialog.Close>Cancel</Dialog.Close>
			<Button>Save changes</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
