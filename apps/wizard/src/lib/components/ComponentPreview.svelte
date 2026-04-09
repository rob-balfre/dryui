<script lang="ts">
	import {
		Alert,
		Badge,
		Breadcrumb,
		Button,
		Card,
		Checkbox,
		Combobox,
		Container,
		DataGrid,
		DescriptionList,
		Field,
		Fieldset,
		Heading,
		Input,
		Label,
		Link,
		List,
		ScrollArea,
		Select,
		Separator,
		Sidebar,
		Stepper,
		Tabs,
		Table,
		Text,
		Textarea
	} from '@dryui/ui';

	interface Props {
		name: string;
	}

	let { name }: Props = $props();

	const gridItems = [
		{ id: '1', name: 'Alpha', status: 'Live', region: 'US-East' },
		{ id: '2', name: 'Beta', status: 'Queued', region: 'EU-West' },
		{ id: '3', name: 'Gamma', status: 'Paused', region: 'AP-South' }
	];
</script>

{#if name === 'PageHeader'}
	<header class="page-header">
		<div class="page-header-content">
			<div class="page-header-eyebrow">Workspace</div>
			<h2 class="page-header-title">Launch Control</h2>
			<p class="page-header-description">Coordinate releases, approvals, and rollout health.</p>
		</div>
		<div class="page-header-actions">
			<Button variant="outline" size="sm">Share</Button>
			<Button size="sm">Publish</Button>
		</div>
		<div class="page-header-meta">
			<Badge variant="soft">live</Badge>
			<Text as="span" size="sm" color="secondary">updated just now</Text>
		</div>
	</header>
{:else if name === 'Stepper'}
	<Stepper.Root activeStep={1}>
		<Stepper.List>
			<Stepper.Step step={0}>Plan</Stepper.Step>
			<Stepper.Separator step={0} />
			<Stepper.Step step={1}>Build</Stepper.Step>
			<Stepper.Separator step={1} />
			<Stepper.Step step={2}>Ship</Stepper.Step>
		</Stepper.List>
	</Stepper.Root>
{:else if name === 'Sidebar'}
	<Sidebar.Root>
		<Sidebar.Header>
			<Text size="sm" color="secondary">Navigation</Text>
		</Sidebar.Header>
		<Sidebar.Content>
			<Sidebar.Group>
				<Sidebar.GroupLabel>Project</Sidebar.GroupLabel>
				<Sidebar.Item active>Overview</Sidebar.Item>
				<Sidebar.Item>Releases</Sidebar.Item>
				<Sidebar.Item>Settings</Sidebar.Item>
			</Sidebar.Group>
		</Sidebar.Content>
	</Sidebar.Root>
{:else if name === 'Card'}
	<Card.Root variant="elevated">
		<Card.Header>
			<Heading level={3}>Daily summary</Heading>
		</Card.Header>
		<Card.Content>
			<Text as="p" color="secondary">A compact panel for metrics, notes, or quick actions.</Text>
		</Card.Content>
		<Card.Footer>
			<Button size="sm" variant="outline">Inspect</Button>
		</Card.Footer>
	</Card.Root>
{:else if name === 'List'}
	<List.Root dense>
		<List.Subheader>Recent items</List.Subheader>
		<List.Item>
			<List.ItemText>
				<div class="list-item-preview">
					<Text as="span">Deploy preview</Text>
					<Text as="span" size="sm" color="secondary">Ready for review</Text>
				</div>
			</List.ItemText>
		</List.Item>
		<List.Item>
			<List.ItemText>
				<div class="list-item-preview">
					<Text as="span">Bug triage</Text>
					<Text as="span" size="sm" color="secondary">2 open items</Text>
				</div>
			</List.ItemText>
		</List.Item>
		<List.Item>
			<List.ItemText>
				<div class="list-item-preview">
					<Text as="span">Content update</Text>
					<Text as="span" size="sm" color="secondary">Scheduled</Text>
				</div>
			</List.ItemText>
		</List.Item>
	</List.Root>
{:else if name === 'DescriptionList'}
	<DescriptionList.Root>
		<DescriptionList.Item>
			<DescriptionList.Term>Owner</DescriptionList.Term>
			<DescriptionList.Description>Design system team</DescriptionList.Description>
		</DescriptionList.Item>
		<DescriptionList.Item>
			<DescriptionList.Term>Status</DescriptionList.Term>
			<DescriptionList.Description>Ready to ship</DescriptionList.Description>
		</DescriptionList.Item>
	</DescriptionList.Root>
{:else if name === 'EmptyState'}
	<div class="empty-state">
		<div class="empty-state-icon">
			<Badge variant="solid" color="gray">0</Badge>
		</div>
		<h3 class="empty-state-title">No components selected</h3>
		<p class="empty-state-description">
			Choose at least one block for this region to see a populated preview.
		</p>
		<div class="empty-state-action">
			<Button size="sm" variant="outline">Browse components</Button>
		</div>
	</div>
{:else if name === 'StatCard'}
	<div role="group" class="stat-card">
		<div class="stat-card-label">Completion</div>
		<div class="stat-card-value">84%</div>
		<div class="stat-card-trend" data-direction="up">↑ 12% from yesterday</div>
	</div>
{:else if name === 'Table'}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Head scope="col">Name</Table.Head>
				<Table.Head scope="col">Status</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row>
				<Table.Cell>Alpha</Table.Cell>
				<Table.Cell><Badge variant="soft">Live</Badge></Table.Cell>
			</Table.Row>
			<Table.Row>
				<Table.Cell>Beta</Table.Cell>
				<Table.Cell><Badge variant="outline">Queued</Badge></Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
{:else if name === 'Alert'}
	<Alert.Root variant="info">
		<Alert.Description>Previewing selected alert content.</Alert.Description>
	</Alert.Root>
{:else if name === 'Badge'}
	<Badge variant="soft">Preview</Badge>
{:else if name === 'Button'}
	<Button variant="solid">Continue</Button>
{:else if name === 'Checkbox'}
	<Checkbox checked>I agree to the plan</Checkbox>
{:else if name === 'Container'}
	<Container size="md">
		<Text as="p">Centered content block.</Text>
	</Container>
{:else if name === 'Heading'}
	<Heading level={3}>Preview heading</Heading>
{:else if name === 'Input'}
	<Input aria-label="Sample input" type="text" value="Sample value" />
{:else if name === 'ScrollArea'}
	<ScrollArea>
		<div class="scroll-preview">
			<Text as="p">Scrollable content</Text>
			<Text as="p" color="secondary">Repeat text to show overflow handling.</Text>
			<Text as="p" color="secondary">Repeat text to show overflow handling.</Text>
			<Text as="p" color="secondary">Repeat text to show overflow handling.</Text>
		</div>
	</ScrollArea>
{:else if name === 'Separator'}
	<Separator />
{:else if name === 'Stack'}
	<div class="stack-sm">
		<Text as="p">Stack item one</Text>
		<Text as="p" color="secondary">Stack item two</Text>
	</div>
{:else if name === 'Text'}
	<Text as="p" color="secondary">Supporting copy for the layout preview.</Text>
{:else if name === 'Breadcrumb'}
	<Breadcrumb.Root>
		<Breadcrumb.Item>Home</Breadcrumb.Item>
		<Breadcrumb.Item>Projects</Breadcrumb.Item>
		<Breadcrumb.Item>Launch Control</Breadcrumb.Item>
	</Breadcrumb.Root>
{:else if name === 'Tabs'}
	<Tabs.Root value="overview">
		<Tabs.List>
			<Tabs.Trigger value="overview">Overview</Tabs.Trigger>
			<Tabs.Trigger value="activity">Activity</Tabs.Trigger>
			<Tabs.Trigger value="settings">Settings</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="overview">
			<Text as="p" color="secondary">Overview panel content.</Text>
		</Tabs.Content>
		<Tabs.Content value="activity">
			<Text as="p" color="secondary">Activity panel content.</Text>
		</Tabs.Content>
		<Tabs.Content value="settings">
			<Text as="p" color="secondary">Settings panel content.</Text>
		</Tabs.Content>
	</Tabs.Root>
{:else if name === 'Link'}
	<div class="link-row">
		<Link>Documentation</Link>
		<Link>API Reference</Link>
		<Link external>GitHub</Link>
	</div>
{:else if name === 'Flex'}
	<div class="flex-preview-row">
		<Badge variant="soft">Status</Badge>
		<Text as="span" size="sm" color="secondary">Flexible layout</Text>
		<Button size="sm" variant="outline">Action</Button>
	</div>
{:else if name === 'DataGrid'}
	<DataGrid.Root items={gridItems} pageSize={5}>
		<DataGrid.Table>
			<DataGrid.Header>
				<DataGrid.Column key="name">Name</DataGrid.Column>
				<DataGrid.Column key="status">Status</DataGrid.Column>
				<DataGrid.Column key="region">Region</DataGrid.Column>
			</DataGrid.Header>
			<DataGrid.Body>
				{#snippet children({ items })}
					{#each items as rawItem}
						{@const item = rawItem as { name: string; status: string; region: string }}
						<DataGrid.Row>
							<DataGrid.Cell>{item.name}</DataGrid.Cell>
							<DataGrid.Cell><Badge variant="soft">{item.status}</Badge></DataGrid.Cell>
							<DataGrid.Cell>{item.region}</DataGrid.Cell>
						</DataGrid.Row>
					{/each}
				{/snippet}
			</DataGrid.Body>
		</DataGrid.Table>
	</DataGrid.Root>
{:else if name === 'Field'}
	<Field.Root>
		<Label>Project name</Label>
		<Input aria-label="Project name" type="text" value="Launch Control" />
		<Field.Description>A short identifier for the project.</Field.Description>
	</Field.Root>
{:else if name === 'Fieldset'}
	<Fieldset.Root>
		<Fieldset.Legend>Notification preferences</Fieldset.Legend>
		<Fieldset.Description>Choose how release updates reach your team.</Fieldset.Description>
		<Fieldset.Content>
			<Checkbox checked>Email digests</Checkbox>
			<Checkbox>SMS alerts</Checkbox>
		</Fieldset.Content>
	</Fieldset.Root>
{:else if name === 'Textarea'}
	<Textarea aria-label="Sample textarea" value="Add release notes here…" />
{:else if name === 'Select'}
	<Select.Root value="beta">
		<Select.Trigger>
			<Select.Value placeholder="Choose environment…" />
		</Select.Trigger>
		<Select.Content>
			<Select.Item value="alpha">Alpha</Select.Item>
			<Select.Item value="beta">Beta</Select.Item>
			<Select.Item value="production">Production</Select.Item>
		</Select.Content>
	</Select.Root>
{:else if name === 'Combobox'}
	<Combobox.Root value="svelte">
		<Combobox.Input placeholder="Search frameworks…" />
		<Combobox.Content>
			<Combobox.Item value="svelte" index={0}>Svelte</Combobox.Item>
			<Combobox.Item value="react" index={1}>React</Combobox.Item>
			<Combobox.Item value="vue" index={2}>Vue</Combobox.Item>
		</Combobox.Content>
	</Combobox.Root>
{:else}
	<Card.Root variant="default">
		<Card.Content>
			<Text as="p" color="secondary">
				{name} is available in the wizard catalog but does not yet have a dedicated preview renderer.
			</Text>
		</Card.Content>
	</Card.Root>
{/if}

<style>
	.scroll-preview {
		display: grid;
		gap: var(--dry-space-3);
		min-height: 140px;
		padding: var(--dry-space-2);
	}

	.stack-sm {
		display: grid;
		gap: var(--dry-space-2);
	}

	.link-row {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.flex-preview-row {
		display: grid;
		grid-template-columns: 1fr auto auto;
		align-items: center;
		gap: var(--dry-space-4);
	}
	.page-header {
		display: grid;
		grid-template-areas:
			'content actions'
			'meta meta';
		grid-template-columns: minmax(0, 1fr) auto;
		gap: var(--dry-space-3) var(--dry-space-4);
		align-items: start;
	}

	.page-header-content {
		grid-area: content;
		display: grid;
		grid-template-columns: minmax(0, 68ch);
		gap: var(--dry-space-1);
	}

	.page-header-eyebrow {
		font-size: var(--dry-text-xs);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--dry-color-text-weak);
	}

	.page-header-title {
		margin: 0;
		font-size: clamp(1.25rem, 2vw + 1rem, 2rem);
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.page-header-description {
		margin: 0;
		color: var(--dry-color-text-weak);
	}

	.page-header-actions {
		grid-area: actions;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		align-items: center;
	}

	.page-header-meta {
		grid-area: meta;
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-3);
		align-items: center;
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

	.empty-state {
		display: grid;
		grid-template-columns: minmax(0, 36ch);
		justify-content: center;
		justify-items: center;
		text-align: center;
		gap: var(--dry-space-4);
		padding: var(--dry-space-8);
	}

	.empty-state-icon {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--dry-color-fill-weak);
		padding: var(--dry-space-3);
	}

	.empty-state-title {
		margin: 0;
		font-weight: 600;
		color: var(--dry-color-text-strong);
	}

	.empty-state-description {
		margin: 0;
		color: var(--dry-color-text-weak);
	}

	.empty-state-action {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
	}
</style>
