<script lang="ts">
	import {
		Avatar,
		Badge,
		Button,
		Card,
		Checkbox,
		Field,
		Input,
		Label,
		Progress,
		RadioGroup,
		Select,
		Slider,
		Text,
		Toggle
	} from '@dryui/ui';
	import { CircleCheck, CircleAlert, AtSign } from 'lucide-svelte';

	let email = $state('jamie@dryui.dev');
	let password = $state('correct-horse-battery');
	let role = $state('admin');
	let plan = $state<'starter' | 'pro' | 'team'>('pro');
	let notificationsOn = $state(true);
	let weeklyDigest = $state(false);
	let usage = $state(72);
	let stepDone = 2;
	let totalSteps = 4;
</script>

<div class="forms-grid">
	<Card.Root size="sm">
		<Card.Header>
			<div class="card-head">
				<Text as="span" weight="semibold">Sign in</Text>
				<Text color="muted">Use your work email to continue.</Text>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="stack">
				<Field.Root>
					<Label for="forms-email">Email</Label>
					<div class="icon-input">
						<AtSign size={14} aria-hidden="true" />
						<Input id="forms-email" bind:value={email} variant="ghost" />
					</div>
				</Field.Root>

				<Field.Root>
					<Label for="forms-password">Password</Label>
					<Input id="forms-password" type="password" bind:value={password} />
				</Field.Root>

				<Field.Root>
					<Label for="forms-bad">Recovery code</Label>
					<Input id="forms-bad" value="X1-not-valid" aria-invalid="true" />
					<div class="field-error">
						<CircleAlert size={12} aria-hidden="true" />
						<Text size="xs">Code must be 8 characters.</Text>
					</div>
				</Field.Root>

				<div class="checkbox-row">
					<Checkbox id="forms-remember" checked />
					<Label for="forms-remember">
						<Text>Remember this device</Text>
					</Label>
				</div>

				<Button variant="solid">Continue</Button>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root size="sm">
		<Card.Header>
			<div class="card-head">
				<Text as="span" weight="semibold">Account preferences</Text>
				<Text color="muted">Plan and notification controls.</Text>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="stack">
				<Field.Root>
					<Label for="forms-role">Role</Label>
					<Select.Root name="role" bind:value={role}>
						<Select.Trigger id="forms-role">
							<Select.Value />
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="admin">Admin</Select.Item>
							<Select.Item value="editor">Editor</Select.Item>
							<Select.Item value="viewer">Viewer</Select.Item>
						</Select.Content>
					</Select.Root>
				</Field.Root>

				<Field.Root>
					<Label>Plan</Label>
					<RadioGroup.Root bind:value={plan} name="plan" orientation="horizontal">
						<RadioGroup.Item value="starter">Starter</RadioGroup.Item>
						<RadioGroup.Item value="pro">Pro</RadioGroup.Item>
						<RadioGroup.Item value="team">Team</RadioGroup.Item>
					</RadioGroup.Root>
				</Field.Root>

				<div class="row-between">
					<div class="row-copy">
						<Text as="span" weight="medium">Notifications</Text>
						<Text color="muted">Email when activity happens.</Text>
					</div>
					<Toggle bind:pressed={notificationsOn} size="sm">
						{notificationsOn ? 'On' : 'Off'}
					</Toggle>
				</div>

				<div class="row-between">
					<div class="row-copy">
						<Text as="span" weight="medium">Weekly digest</Text>
						<Text color="muted">A summary every Monday.</Text>
					</div>
					<Toggle bind:pressed={weeklyDigest} size="sm">
						{weeklyDigest ? 'On' : 'Off'}
					</Toggle>
				</div>

				<Field.Root>
					<Label for="forms-usage">Usage allocation</Label>
					<Slider id="forms-usage" bind:value={usage} min={0} max={100} size="sm" />
					<Text size="xs" color="muted">{usage}% allocated</Text>
				</Field.Root>
			</div>
		</Card.Content>
	</Card.Root>

	<Card.Root size="sm">
		<Card.Header>
			<div class="card-head">
				<div class="head-row">
					<Text as="span" weight="semibold">Onboarding</Text>
					<Badge variant="soft" color="blue" size="sm">Step {stepDone} of {totalSteps}</Badge>
				</div>
				<Text color="muted">Complete the workspace setup.</Text>
			</div>
		</Card.Header>
		<Card.Content>
			<div class="stack">
				<Progress value={(stepDone / totalSteps) * 100} size="sm" />

				<ul class="step-list">
					<li class="step done">
						<CircleCheck size={16} aria-hidden="true" />
						<Text>Connect your repository</Text>
					</li>
					<li class="step done">
						<CircleCheck size={16} aria-hidden="true" />
						<Text>Invite collaborators</Text>
					</li>
					<li class="step current">
						<span class="step-dot" aria-hidden="true"></span>
						<Text as="span" weight="medium">Configure deploy targets</Text>
					</li>
					<li class="step pending">
						<span class="step-dot" aria-hidden="true"></span>
						<Text color="muted">Verify domain ownership</Text>
					</li>
				</ul>

				<div class="head-row">
					<div class="avatar-row">
						<span class="avatar-slot"><Avatar fallback="JD" size="sm" /></span>
						<span class="avatar-slot"><Avatar fallback="MK" size="sm" /></span>
						<span class="avatar-slot"><Avatar fallback="SR" size="sm" /></span>
					</div>
					<div class="row-actions">
						<Button variant="ghost" size="sm">Skip</Button>
						<Button variant="solid" size="sm">Continue</Button>
					</div>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.forms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: var(--dry-space-4);
		container-type: inline-size;
	}

	.stack {
		display: grid;
		gap: var(--dry-space-3);
	}

	.card-head {
		display: grid;
		gap: var(--dry-space-1);
	}

	.head-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.icon-input {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
		padding: var(--dry-space-2) var(--dry-space-3);
		border: 1px solid var(--dry-form-control-border);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-form-control-bg);
		color: var(--dry-color-text-weak);
		--dry-input-padding-x: 0;
	}

	.checkbox-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-3);
	}

	.row-between {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		align-items: center;
		gap: var(--dry-space-3);
	}

	.row-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.row-actions {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
	}

	.field-error {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-1);
		--dry-typography-text-color: var(--dry-color-text-danger);
		color: var(--dry-color-text-danger);
	}

	.step-list {
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--dry-space-2);
		list-style: none;
	}

	.step {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2_5);
	}

	.step.done {
		color: var(--dry-color-text-success);
	}

	.step.current {
		color: var(--dry-color-text-strong);
	}

	.step.pending {
		color: var(--dry-color-text-weak);
	}

	.step-dot {
		display: inline-grid;
		grid-template-columns: 0.625rem;
		grid-template-rows: 0.625rem;
		border-radius: 50%;
		background: currentColor;
	}

	.step.pending .step-dot {
		background: transparent;
		border: 1.5px solid currentColor;
	}

	.avatar-row {
		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: 0;
		--dry-avatar-size: 1.75rem;
		--dry-avatar-font-size: var(--dry-text-xs-size);
	}

	.avatar-slot {
		display: inline-grid;
		border-radius: 9999px;
		background: var(--dry-color-bg-raised);
		box-shadow: 0 0 0 2px var(--dry-color-bg-raised);
	}

	.avatar-slot + .avatar-slot {
		margin-inline-start: calc(var(--dry-space-2) * -1);
	}
</style>
