<script lang="ts">
	import { AlertDialog, Text } from '@dryui/ui';

	interface Props {
		userName: string;
		open?: boolean;
		onConfirm: () => void;
	}

	let { userName, open = $bindable(false), onConfirm }: Props = $props();

	function handleConfirm() {
		onConfirm();
		open = false;
	}
</script>

<AlertDialog.Root bind:open>
	<AlertDialog.Overlay />
	<AlertDialog.Content>
		<AlertDialog.Header>Remove user?</AlertDialog.Header>
		<AlertDialog.Body>
			<Text>
				This will remove {userName} from the workspace. This action cannot be undone.
			</Text>
		</AlertDialog.Body>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action onclick={handleConfirm}>Remove</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
