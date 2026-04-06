<script lang="ts">
	import { AlertDialog, Button, Card, Field, Input, Label, Select, Toggle, Text } from '@dryui/ui';

	let plan = $state('team');
	let notifications = $state(false);
	let open = $state(false);
</script>

<div class="preview">
	<div class="stack-lg">
		<div class="stack-sm">
			<Text as="span" color="muted">Settings form</Text>
			<Text as="p" color="muted">Save confirmation via dialog — pops over the form.</Text>
		</div>

		<Card.Root>
			<Card.Content>
				<div class="stack-lg">
					<Field.Root>
						<Label for="toast-workspace-name">Workspace name</Label>
						<Input id="toast-workspace-name" value="DryUI Studio" />
						<Field.Description>This name appears in headers and project links.</Field.Description>
					</Field.Root>

					<Field.Root>
						<Label for="toast-workspace-plan">Plan</Label>
						<Select.Root bind:value={plan} name="toast-plan">
							<Select.Trigger id="toast-workspace-plan">
								<Select.Value placeholder="Choose a plan..." />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="starter">Starter</Select.Item>
								<Select.Item value="team">Team</Select.Item>
								<Select.Item value="enterprise">Enterprise</Select.Item>
							</Select.Content>
						</Select.Root>
					</Field.Root>

					<Field.Root>
						<Label for="toast-notifications">Notifications</Label>
						<div class="toggle-row">
							<Toggle id="toast-notifications" bind:pressed={notifications}>
								{notifications ? 'Enabled' : 'Disabled'}
							</Toggle>
						</div>
						<Field.Description>Keep save confirmations and invites turned on.</Field.Description>
					</Field.Root>

					<AlertDialog.Root bind:open>
						<AlertDialog.Trigger>
							<Button variant="solid">Save changes</Button>
						</AlertDialog.Trigger>
						<AlertDialog.Overlay />
						<AlertDialog.Content>
							<AlertDialog.Header>Confirm save</AlertDialog.Header>
							<AlertDialog.Body>
								<Text as="p"
									>Save workspace settings? This will update notification preferences immediately.</Text
								>
							</AlertDialog.Body>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<AlertDialog.Action>Confirm</AlertDialog.Action>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	.preview {
		padding: var(--dry-space-5);
		background: var(--dry-color-bg-raised);
	}

	.toggle-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
