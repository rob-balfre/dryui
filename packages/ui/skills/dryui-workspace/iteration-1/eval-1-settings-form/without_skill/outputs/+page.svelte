<script lang="ts">
	import {
		Button,
		Card,
		Container,
		Field,
		Heading,
		Input,
		Label,
		Text,
		Toggle
	} from '@dryui/ui';

	let displayName = $state('');
	let email = $state('');
	let notificationsEnabled = $state(true);
	let submitting = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		try {
			// Replace with real API call.
			await new Promise((r) => setTimeout(r, 400));
			console.log('settings saved', {
				displayName,
				email,
				notificationsEnabled
			});
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<main class="page">
	<Container size="sm">
		<header class="page-header">
			<Heading level={1}>Settings</Heading>
			<Text color="muted">Update your profile and notification preferences.</Text>
		</header>

		<form class="form" onsubmit={handleSubmit} novalidate>
			<Card.Root>
				<Card.Header>
					<Heading level={2}>Profile</Heading>
					<Text color="muted" size="sm">How you appear across the app.</Text>
				</Card.Header>

				<Card.Content>
					<div class="fields">
						<Field.Root required>
							<Label>Display name</Label>
							<Input
								type="text"
								placeholder="Ada Lovelace"
								autocomplete="name"
								bind:value={displayName}
							/>
						</Field.Root>

						<Field.Root required>
							<Label>Email</Label>
							<Input
								type="email"
								placeholder="ada@example.com"
								autocomplete="email"
								bind:value={email}
							/>
						</Field.Root>

						<Field.Root>
							<div class="toggle-row">
								<div class="toggle-copy">
									<Label>Notifications enabled</Label>
									<Text color="muted" size="sm">
										Receive product updates and account alerts.
									</Text>
								</div>
								<Toggle bind:pressed={notificationsEnabled} />
							</div>
						</Field.Root>
					</div>
				</Card.Content>

				<Card.Footer>
					<div class="footer-actions">
						<Button
							type="submit"
							variant="solid"
							color="primary"
							size="md"
							disabled={submitting}
						>
							{submitting ? 'Saving…' : 'Save changes'}
						</Button>
					</div>
				</Card.Footer>
			</Card.Root>
		</form>
	</Container>
</main>

<style>
	.page {
		min-block-size: 100dvh;
		padding-block: var(--dry-space-10);
		padding-inline: var(--dry-space-4);
		background: var(--dry-color-bg-base);
		color: var(--dry-color-text-strong);
	}

	.page-header {
		display: grid;
		gap: var(--dry-space-2);
		margin-block-end: var(--dry-space-6);
	}

	.form {
		display: grid;
	}

	.fields {
		display: grid;
		gap: var(--dry-space-5);
	}

	.toggle-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.toggle-copy {
		display: grid;
		gap: var(--dry-space-1);
	}

	.footer-actions {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		justify-items: end;
	}
</style>
</content>
</invoke>