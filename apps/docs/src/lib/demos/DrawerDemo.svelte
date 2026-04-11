<script>
	import { Badge, Button, Card, Drawer, Separator, Text, Toggle } from '@dryui/ui';

	let drawerOpen = $state(false);
	let releaseUpdates = $state(true);
	let weeklyDigest = $state(false);
	let privacyMode = $state(true);
</script>

<Drawer.Root bind:open={drawerOpen} side="right">
	<Drawer.Trigger><Button>Open Drawer</Button></Drawer.Trigger>
	<Drawer.Content>
		<Drawer.Header>
			<div class="header-stack">
				<div class="header-row">
					<Text as="span" size="sm" color="muted">Workspace settings</Text>
					<Badge variant="outline" color="gray">Live</Badge>
				</div>

				<div class="title-stack">
					<Text as="p" size="lg" weight="semibold">Settings</Text>
					<Text as="p" size="sm" color="secondary">
						Keep notifications, review flow, and privacy defaults aligned for the whole workspace.
					</Text>
				</div>
			</div>
		</Drawer.Header>

		<Drawer.Body>
			<div class="panel-stack">
				<Card.Root variant="elevated" size="sm">
					<Card.Content>
						<div class="card-stack">
							<div class="summary-row">
								<div class="title-stack">
									<Text as="span" variant="label" size="sm">DryUI Studio</Text>
									<Text as="p" size="sm" color="secondary">
										Team workspace with shared review notifications.
									</Text>
								</div>
								<Badge variant="soft">Team plan</Badge>
							</div>

							<Separator />

							<div class="summary-grid">
								<div class="summary-cell">
									<Text as="span" size="sm" color="muted">Owners</Text>
									<Text as="p" weight="semibold">4 active</Text>
								</div>
								<div class="summary-cell">
									<Text as="span" size="sm" color="muted">Digest window</Text>
									<Text as="p" weight="semibold">09:00 daily</Text>
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root size="sm">
					<Card.Header>
						<div class="title-stack">
							<Text as="p" weight="semibold">Alerts and activity</Text>
							<Text as="p" size="sm" color="secondary">
								Choose what gets pushed into inboxes and shared channels.
							</Text>
						</div>
					</Card.Header>

					<Card.Content>
						<div class="card-stack">
							<div class="setting-row">
								<div class="setting-copy">
									<Text as="p" weight="medium">Release updates</Text>
									<Text as="p" size="sm" color="secondary">
										Send shipping notes, fixes, and rollout changes to the team.
									</Text>
								</div>
								<Toggle bind:pressed={releaseUpdates} size="sm">
									{releaseUpdates ? 'On' : 'Off'}
								</Toggle>
							</div>

							<Separator />

							<div class="setting-row">
								<div class="setting-copy">
									<Text as="p" weight="medium">Weekly digest</Text>
									<Text as="p" size="sm" color="secondary">
										Bundle approvals and unread updates into a single summary.
									</Text>
								</div>
								<Toggle bind:pressed={weeklyDigest} size="sm">
									{weeklyDigest ? 'On' : 'Off'}
								</Toggle>
							</div>

							<Separator />

							<div class="setting-row">
								<div class="setting-copy">
									<Text as="p" weight="medium">Privacy mode</Text>
									<Text as="p" size="sm" color="secondary">
										Hide collaborator emails in mentions and audit snapshots.
									</Text>
								</div>
								<Toggle bind:pressed={privacyMode} size="sm">
									{privacyMode ? 'On' : 'Off'}
								</Toggle>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</Drawer.Body>

		<Drawer.Footer>
			<Button variant="secondary" onclick={() => (drawerOpen = false)}>Cancel</Button>
			<Button variant="solid" onclick={() => (drawerOpen = false)}>Save changes</Button>
		</Drawer.Footer>
	</Drawer.Content>
</Drawer.Root>

<style>
	.header-stack,
	.title-stack,
	.panel-stack,
	.card-stack,
	.summary-cell,
	.setting-copy {
		display: grid;
	}

	.header-stack,
	.panel-stack,
	.card-stack {
		gap: var(--dry-space-4);
	}

	.title-stack {
		gap: var(--dry-space-2);
	}

	.summary-cell,
	.setting-copy {
		gap: var(--dry-space-1);
	}

	.header-row,
	.summary-row,
	.setting-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) max-content;
		gap: var(--dry-space-3);
	}

	.header-row,
	.summary-row {
		align-items: center;
	}

	.setting-row {
		align-items: start;
	}

	.summary-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}
</style>
