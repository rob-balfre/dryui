<script lang="ts">
	import {
		Alert,
		Badge,
		Button,
		Card,
		Checkbox,
		Field,
		Input,
		Label,
		Select,
		Table,
		Text
	} from '@dryui/ui';

	const rows = [
		{ name: 'Alex Morgan', role: 'Admin', status: 'Active', color: 'success' as const },
		{ name: 'Jordan Lee', role: 'Editor', status: 'Pending', color: 'warning' as const },
		{ name: 'Sam Rivera', role: 'Viewer', status: 'Inactive', color: 'gray' as const }
	];
</script>

<div class="preview-root">
	<div class="stat-row">
		<div role="group" class="stat-card">
			<div class="stat-card-label">Active users</div>
			<div class="stat-card-value">12,450</div>
			<div class="stat-card-trend" data-direction="up">↑ +8.3% this week</div>
		</div>
		<div role="group" class="stat-card">
			<div class="stat-card-label">Requests</div>
			<div class="stat-card-value">98,201</div>
			<div class="stat-card-trend" data-direction="up">↑ +2.1%</div>
		</div>
		<div role="group" class="stat-card">
			<div class="stat-card-label">Error rate</div>
			<div class="stat-card-value">0.4%</div>
			<div class="stat-card-trend" data-direction="down">↓ -0.1%</div>
		</div>
	</div>

	<div class="main-grid">
		<div class="stack">
			<Card.Root>
				<Card.Header>
					<Text as="span" weight="semibold">Component preview</Text>
				</Card.Header>
				<Card.Content>
					<div class="stack">
						<Alert.Root variant="info">
							<Alert.Title>Theme applied</Alert.Title>
							<Alert.Description>All tokens are resolved from your brand color.</Alert.Description>
						</Alert.Root>

						<div class="btn-row">
							<Button variant="solid">Save changes</Button>
							<Button variant="secondary">Cancel</Button>
							<Button variant="outline">Duplicate</Button>
							<Button variant="ghost">Dismiss</Button>
						</div>

						<div class="badge-row">
							<Badge color="gray">Neutral</Badge>
							<Badge color="blue">Info</Badge>
							<Badge color="green">Success</Badge>
							<Badge color="yellow">Warning</Badge>
							<Badge color="red">Error</Badge>
							<Badge color="purple">Brand</Badge>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Text as="span" weight="semibold">Form fields</Text>
				</Card.Header>
				<Card.Content>
					<div class="form-grid">
						<Field.Root>
							<Label for="preview-name">Display name</Label>
							<Input id="preview-name" value="Jane Smith" />
						</Field.Root>
						<Field.Root>
							<Label for="preview-role">Role</Label>
							<Select.Root name="role">
								<Select.Trigger id="preview-role">
									<Select.Value placeholder="Select role" />
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="admin">Admin</Select.Item>
									<Select.Item value="editor">Editor</Select.Item>
									<Select.Item value="viewer">Viewer</Select.Item>
								</Select.Content>
							</Select.Root>
						</Field.Root>
						<div class="checkbox-row">
							<Checkbox id="preview-notify" checked />
							<Label for="preview-notify">
								<Text size="sm">Enable notifications</Text>
							</Label>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header>
				<Text as="span" weight="semibold">Members</Text>
			</Card.Header>
			<Card.Content noPadding>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Role</Table.Head>
							<Table.Head>Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each rows as row (row.name)}
							<Table.Row>
								<Table.Cell>{row.name}</Table.Cell>
								<Table.Cell>{row.role}</Table.Cell>
								<Table.Cell>
									<Badge color={row.color} size="sm">{row.status}</Badge>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	.preview-root {
		display: grid;
		gap: var(--dry-space-5);
		container-type: inline-size;
	}

	.stat-row {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--dry-space-4);
	}

	.main-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--dry-space-5);
		align-items: start;
	}

	.stack {
		display: grid;
		gap: var(--dry-space-4);
	}

	.btn-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-2);
	}

	.badge-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		justify-content: start;
		gap: var(--dry-space-2);
	}

	.form-grid {
		display: grid;
		gap: var(--dry-space-3);
	}

	.checkbox-row {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		align-items: center;
		gap: var(--dry-space-2);
	}

	@container (max-width: 52rem) {
		.main-grid {
			grid-template-columns: 1fr;
		}
	}

	@container (max-width: 36rem) {
		.stat-row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.badge-row {
			grid-auto-flow: row;
			grid-template-columns: repeat(3, max-content);
		}
	}

	@container (max-width: 24rem) {
		.stat-row {
			grid-template-columns: 1fr;
		}

		.btn-row {
			grid-auto-flow: row;
			grid-template-columns: repeat(2, max-content);
		}
	}
	.stat-card {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-4);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-md);
	}

	.stat-card-label {
		font-size: var(--dry-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--dry-color-text-weak);
	}

	.stat-card-value {
		font-size: clamp(1.5rem, 2vw + 1rem, 2.25rem);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.stat-card-trend {
		font-size: var(--dry-text-sm);
	}

	.stat-card-trend[data-direction='up'] {
		color: var(--dry-color-text-success);
	}

	.stat-card-trend[data-direction='down'] {
		color: var(--dry-color-text-error);
	}

	.stat-card-trend[data-direction='neutral'] {
		color: var(--dry-color-text-weak);
	}

</style>
