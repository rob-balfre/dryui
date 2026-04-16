<script lang="ts">
	import { Button, Dialog, Field, Input, Label, Text } from '@dryui/ui';

	let dialogOpen = $state(false);
	let policyOwner = $state('Operations lead');
</script>

<div class="dialog-demo">
	<div class="dialog-intro">
		<Text as="p" size="lg" weight="semibold">Keep short editing tasks in context.</Text>
		<div class="dialog-copy">
			<Text as="p" color="secondary">
				A dialog should open with a specific title, a focused task, and an obvious way to back out.
			</Text>
		</div>
	</div>

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger>
			<Button variant="outline">Edit policy</Button>
		</Dialog.Trigger>
		<Dialog.Overlay />
		<Dialog.Content>
			<Dialog.Header>Travel policy update</Dialog.Header>
			<Dialog.Body>
				<div class="dialog-body-content">
					<Text as="p" size="sm" color="secondary">
						Assign an owner before publishing the latest review changes.
					</Text>
					<Field.Root>
						<Label>Policy owner</Label>
						<Input bind:value={policyOwner} placeholder="Operations lead" />
					</Field.Root>
				</div>
			</Dialog.Body>
			<Dialog.Footer>
				<Dialog.Close>Cancel</Dialog.Close>
				<Button variant="solid" onclick={() => (dialogOpen = false)}>Publish</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>

	<div class="dialog-copy">
		<Text as="p" size="sm" color="secondary">
			Use <code>Dialog</code> for lightweight edits and reserve <code>AlertDialog</code> for destructive
			confirmations.
		</Text>
	</div>
</div>

<style>
	.dialog-demo,
	.dialog-intro,
	.dialog-body-content {
		display: grid;
	}

	.dialog-demo {
		gap: var(--dry-space-4);
		justify-items: center;
	}

	.dialog-intro,
	.dialog-body-content {
		gap: var(--dry-space-2);
	}

	.dialog-intro,
	.dialog-copy {
		text-align: center;
	}

	.dialog-copy {
		display: grid;
		grid-template-columns: minmax(0, 38ch);
	}

	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
	}
</style>
