<script lang="ts">
	import { Button, Dialog, Field, Input, Label } from '@dryui/ui';

	let value = $state('');
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button variant="solid">Open dialog</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Dialog title</Dialog.Header>
		<Dialog.Body>
			<Field.Root>
				<Label>Label</Label>
				<Input bind:value placeholder="Placeholder" />
			</Field.Root>
		</Dialog.Body>
		<Dialog.Footer>
			<Button variant="ghost">Cancel</Button>
			<Button variant="solid">Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
