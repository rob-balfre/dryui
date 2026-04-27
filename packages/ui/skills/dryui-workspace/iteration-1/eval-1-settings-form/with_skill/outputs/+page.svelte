<script lang="ts">
	import { Button, Card, Container, Field, Heading, Input, Label, Text, Toggle } from '@dryui/ui';

	let displayName = $state('');
	let email = $state('');
	let notificationsEnabled = $state(true);

	let submitted = $state(false);

	let emailError = $derived(
		submitted && email && !email.includes('@') ? 'Please enter a valid email' : ''
	);

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		if (emailError) return;
		// In a real app: persist settings here.
	}
</script>

<main class="settings-main">
	<Container size="md">
		<div class="settings-stack">
			<header class="settings-header">
				<Heading level={1}>Settings</Heading>
				<Text color="muted">Manage your account preferences.</Text>
			</header>

			<Card.Root>
				<Card.Header>
					<Heading level={2}>Profile</Heading>
				</Card.Header>
				<Card.Content>
					<form class="form-stack" onsubmit={handleSubmit}>
						<Field.Root>
							<Label>Display name</Label>
							<Input type="text" bind:value={displayName} placeholder="Ada Lovelace" />
						</Field.Root>

						<Field.Root error={emailError}>
							<Label>Email</Label>
							<Input type="email" bind:value={email} placeholder="you@example.com" />
							{#if emailError}
								<Field.Error>{emailError}</Field.Error>
							{/if}
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="toggle-copy">
									<Label>Notifications enabled</Label>
									<Text color="muted" size="sm">Receive product updates and account alerts.</Text>
								</div>
								<Toggle bind:pressed={notificationsEnabled} aria-label="Toggle notifications">
									{notificationsEnabled ? 'On' : 'Off'}
								</Toggle>
							</div>
						</Field.Root>

						<div class="form-actions">
							<Button type="submit" variant="solid">Save settings</Button>
						</div>
					</form>
				</Card.Content>
			</Card.Root>
		</div>
	</Container>
</main>

<style>
	.settings-main {
		padding: var(--dry-space-12) 0;
	}
	.settings-stack {
		display: grid;
		gap: var(--dry-space-8);
	}
	.settings-header {
		display: grid;
		gap: var(--dry-space-2);
	}
	.form-stack {
		display: grid;
		gap: var(--dry-space-5);
	}
	.toggle-row {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-4);
	}
	.toggle-copy {
		display: grid;
		gap: var(--dry-space-1);
	}
	.form-actions {
		display: grid;
		grid-template-columns: auto;
		justify-content: end;
		padding-top: var(--dry-space-2);
	}
</style>
