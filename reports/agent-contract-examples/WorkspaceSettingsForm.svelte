<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';

	import {
		Badge,
		Button,
		Card,
		Container,
		Field,
		Heading,
		Input,
		Label,
		Select,
		Text,
		Textarea
	} from '@dryui/ui';

	let workspaceName = $state('DryUI Labs');
	let contactEmail = $state('ops@example.com');
	let plan = $state('team');
	let notes = $state('Keep rollout notes short and action-oriented.');
	let submitted = $state(false);

	let workspaceError = $derived(submitted && !workspaceName ? 'Workspace name is required' : '');
	let emailError = $derived(
		submitted && !contactEmail
			? 'Contact email is required'
			: submitted && !contactEmail.includes('@')
				? 'Enter a valid contact email'
				: ''
	);
	let hasErrors = $derived(Boolean(workspaceError || emailError));

	function saveSettings() {
		submitted = true;
	}
</script>

<Container size="lg">
	<div class="settings-shell">
		<Card.Root>
			<Card.Header>
				<div class="header-grid">
					<div class="heading-copy">
						<Badge variant="soft">Settings</Badge>
						<Heading level={1}>Workspace profile</Heading>
						<Text color="secondary">
							Contract-guided form composition with labeled fields and deterministic validation.
						</Text>
					</div>

					{#if submitted && !hasErrors}
						<Badge variant="soft" color="green">Saved locally</Badge>
					{:else if hasErrors}
						<Badge variant="soft" color="red">Needs attention</Badge>
					{:else}
						<Badge variant="outline">Draft</Badge>
					{/if}
				</div>
			</Card.Header>

			<Card.Content>
				<div class="form-grid">
					<Field.Root required error={workspaceError}>
						<Label>Workspace name</Label>
						<Input bind:value={workspaceName} name="workspaceName" />
						<Field.Description
							>Shown in dashboards, reports, and invitation emails.</Field.Description
						>
						{#if workspaceError}
							<Field.Error>{workspaceError}</Field.Error>
						{/if}
					</Field.Root>

					<Field.Root required error={emailError}>
						<Label>Contact email</Label>
						<Input bind:value={contactEmail} name="contactEmail" type="email" />
						<Field.Description>Used for release and billing notifications.</Field.Description>
						{#if emailError}
							<Field.Error>{emailError}</Field.Error>
						{/if}
					</Field.Root>

					<Field.Root>
						<Label>Plan</Label>
						<Select.Root bind:value={plan} name="plan">
							<Select.Trigger>
								<Select.Value placeholder="Choose a plan" />
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="starter">Starter</Select.Item>
								<Select.Item value="team">Team</Select.Item>
								<Select.Item value="enterprise">Enterprise</Select.Item>
							</Select.Content>
						</Select.Root>
						<Field.Description>Controls visible limits in the workspace UI.</Field.Description>
					</Field.Root>

					<Field.Root>
						<Label>Internal notes</Label>
						<Textarea bind:value={notes} name="notes" />
						<Field.Description
							>Keep this concise so agents can summarize it reliably.</Field.Description
						>
					</Field.Root>
				</div>
			</Card.Content>

			<Card.Footer>
				<div class="footer-actions">
					<Button variant="outline" onclick={() => (submitted = false)}>Reset status</Button>
					<Button type="button" onclick={saveSettings}>Save settings</Button>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>
</Container>

<style>
	.settings-shell {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-5);
		padding-block: var(--dry-space-6);
	}

	.header-grid,
	.heading-copy,
	.form-grid,
	.footer-actions {
		display: grid;
		gap: var(--dry-space-4);
	}

	@container (min-width: 42rem) {
		.header-grid,
		.footer-actions {
			align-items: center;
			grid-template-columns: 1fr auto;
		}

		.form-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
