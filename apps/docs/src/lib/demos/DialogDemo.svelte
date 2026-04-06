<script>
	import { Dialog, Button } from '@dryui/ui';

	let showDialog = $state(false);
</script>

<Dialog.Root bind:open={showDialog}>
	<Dialog.Trigger>
		<Button>Open Dialog</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Confirm action</Dialog.Header>
		<p>Are you sure you want to proceed?</p>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (showDialog = false)}>Cancel</Button>
			<Button variant="solid" onclick={() => (showDialog = false)}>Confirm</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
