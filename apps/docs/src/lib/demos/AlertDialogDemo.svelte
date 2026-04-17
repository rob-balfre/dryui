<script lang="ts">
	import { AlertDialog, Button, Text } from '@dryui/ui';
</script>

<div class="alert-demo">
	<div class="alert-intro">
		<Text as="p" size="lg" weight="semibold">Confirm before anything destructive.</Text>
		<div class="alert-copy">
			<Text as="p" color="secondary">
				An alert dialog interrupts the flow so the user has to acknowledge the consequences before
				the action runs.
			</Text>
		</div>
	</div>

	<AlertDialog.Root>
		<AlertDialog.Trigger
			><Button variant="solid" color="danger">Delete item</Button></AlertDialog.Trigger
		>
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

	<div class="alert-copy">
		<Text as="p" size="sm" color="secondary">
			Reserve <code>AlertDialog</code> for confirmations that can't be undone. Use
			<code>Dialog</code> for everyday edits.
		</Text>
	</div>
</div>

<style>
	.alert-demo,
	.alert-intro {
		display: grid;
	}

	.alert-demo {
		gap: var(--dry-space-4);
		justify-items: center;
	}

	.alert-intro {
		gap: var(--dry-space-2);
	}

	.alert-intro,
	.alert-copy {
		text-align: center;
	}

	.alert-copy {
		display: grid;
		grid-template-columns: minmax(0, 42ch);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}
</style>
