<script lang="ts">
	import { Button, Field, Input, Label, Select, Toggle, Text } from '@dryui/ui';

	let plan = $state('team');
	let notifications = $state(false);
</script>

<div class="preview">
	<div class="stack-lg">
		<div class="stack-sm">
			<Text as="span" color="muted">Settings form</Text>
			<Text as="p" color="muted">
				Labeled fields, clear helper text, and a lightweight validation pattern.
			</Text>
		</div>

		<div class="form-grid">
			<div class="surface">
				<div class="stack-lg">
					<Field.Root>
						<Label for="workspace-name">Workspace name</Label>
						<Input id="workspace-name" value="DryUI Studio" />
						<Field.Description>This name appears in headers and project links.</Field.Description>
					</Field.Root>

					<Field.Root>
						<Label for="workspace-plan">Plan</Label>
						<Select.Root bind:value={plan} name="plan">
							<Select.Trigger id="workspace-plan">
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
						<Label for="notifications">Notifications</Label>
						<div class="toggle-row">
							<Toggle id="notifications" bind:pressed={notifications}>
								{notifications ? 'Enabled' : 'Disabled'}
							</Toggle>
						</div>
						<Field.Description>Keep save confirmations and invites turned on.</Field.Description>
					</Field.Root>

					<Button variant="solid">Save changes</Button>
				</div>
			</div>

			<div class="surface">
				<div class="stack-md">
					<Text as="span" color="muted">Validation notes</Text>
					<Text as="p"
						>Errors and helper text can live together without breaking the form rhythm.</Text
					>

					<Field.Root error="Workspace name is required">
						<Label for="workspace-name-error">Workspace name</Label>
						<Input id="workspace-name-error" value="" placeholder="Add a workspace name" />
						<Field.Error>Workspace name is required</Field.Error>
					</Field.Root>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.preview {
		padding: var(--dry-space-5);
		background: var(--dry-color-bg-raised);
	}

	.surface {
		padding: var(--dry-padding-card);
		background: var(--dry-color-bg-raised);
		border-radius: var(--dry-radius-card);
		box-shadow: var(--dry-shadow-sm);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--dry-space-4);
	}

	.toggle-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}
</style>
