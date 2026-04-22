<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';

	import {
		Avatar,
		Badge,
		Button,
		Card,
		Container,
		Dialog,
		Field,
		Heading,
		Input,
		Label,
		Select,
		Text
	} from '@dryui/ui';

	let inviteOpen = $state(false);
	let email = $state('');
	let role = $state('editor');
	let team = $state('design-systems');

	let pendingInvites = $state([
		{ email: 'mira@example.com', initials: 'MR', role: 'reviewer' },
		{ email: 'noah@example.com', initials: 'NL', role: 'editor' }
	]);

	let inviteError = $derived(email && !email.includes('@') ? 'Enter a valid email address' : '');

	function queueInvite() {
		if (!email || inviteError) return;

		pendingInvites.push({
			email,
			initials: email.slice(0, 2).toUpperCase(),
			role
		});
		email = '';
		inviteOpen = false;
	}

	function removeInvite(targetEmail) {
		pendingInvites = pendingInvites.filter((invite) => invite.email !== targetEmail);
	}
</script>

<Container size="lg">
	<div class="invite-shell">
		<Card.Root>
			<Card.Header>
				<div class="heading-grid">
					<div class="heading-copy">
						<Badge variant="soft" color="blue">Access</Badge>
						<Heading level={1}>Pending invitations</Heading>
						<Text color="secondary">A dialog flow generated from component prompt context.</Text>
					</div>

					<Dialog.Root bind:open={inviteOpen}>
						<Dialog.Trigger>
							<Button>Invite teammate</Button>
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>Invite teammate</Dialog.Header>
							<Dialog.Body>
								<div class="dialog-fields">
									<Field.Root error={inviteError} required>
										<Label>Email</Label>
										<Input bind:value={email} name="email" type="email" />
										<Field.Description
											>Invitations are queued locally in this example.</Field.Description
										>
										{#if inviteError}
											<Field.Error>{inviteError}</Field.Error>
										{/if}
									</Field.Root>

									<Field.Root>
										<Label>Role</Label>
										<Select.Root bind:value={role} name="role">
											<Select.Trigger>
												<Select.Value placeholder="Choose role" />
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="viewer">Viewer</Select.Item>
												<Select.Item value="reviewer">Reviewer</Select.Item>
												<Select.Item value="editor">Editor</Select.Item>
											</Select.Content>
										</Select.Root>
									</Field.Root>

									<Field.Root>
										<Label>Team</Label>
										<Select.Root bind:value={team} name="team">
											<Select.Trigger>
												<Select.Value placeholder="Choose team" />
											</Select.Trigger>
											<Select.Content>
												<Select.Item value="design-systems">Design systems</Select.Item>
												<Select.Item value="platform">Platform</Select.Item>
												<Select.Item value="docs">Docs</Select.Item>
											</Select.Content>
										</Select.Root>
									</Field.Root>
								</div>
							</Dialog.Body>
							<Dialog.Footer>
								<div class="dialog-actions">
									<Button variant="outline" onclick={() => (inviteOpen = false)}>Cancel</Button>
									<Button onclick={queueInvite}>Queue invite</Button>
								</div>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>
				</div>
			</Card.Header>

			<Card.Content>
				<div class="invite-list">
					{#each pendingInvites as invite (invite.email)}
						<div class="invite-row">
							<Avatar fallback={invite.initials} alt={invite.email} />
							<div>
								<Text weight="semibold">{invite.email}</Text>
								<Text color="muted" size="sm">{team}</Text>
							</div>
							<Badge variant="soft">{invite.role}</Badge>
							<Button variant="ghost" size="sm" onclick={() => removeInvite(invite.email)}
								>Remove</Button
							>
						</div>
					{:else}
						<div class="empty-row">
							<Text color="secondary">No pending invitations.</Text>
						</div>
					{/each}
				</div>
			</Card.Content>

			<Card.Footer>
				<Text color="muted" size="sm">{pendingInvites.length} invitation drafts queued</Text>
			</Card.Footer>
		</Card.Root>
	</div>
</Container>

<style>
	.invite-shell {
		container-type: inline-size;
		display: grid;
		gap: var(--dry-space-5);
		padding-block: var(--dry-space-6);
	}

	.heading-grid,
	.heading-copy,
	.dialog-fields,
	.dialog-actions,
	.invite-list {
		display: grid;
		gap: var(--dry-space-4);
	}

	.invite-row,
	.empty-row {
		align-items: center;
		background: var(--dry-color-surface);
		border: var(--dry-border-default);
		border-radius: var(--dry-radius-md);
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-3);
	}

	.invite-row {
		grid-template-columns: auto 1fr auto auto;
	}

	@container (min-width: 42rem) {
		.heading-grid {
			align-items: center;
			grid-template-columns: 1fr auto;
		}

		.dialog-actions {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
</style>
