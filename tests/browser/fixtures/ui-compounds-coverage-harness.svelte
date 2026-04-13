<script lang="ts">
	import '../../../packages/ui/src/themes/default.css';
	import '../../../packages/ui/src/themes/dark.css';
	import { Alert } from '../../../packages/ui/src/alert/index.js';
	import { List } from '../../../packages/ui/src/list/index.js';
	import { Table } from '../../../packages/ui/src/table/index.js';
	import { Timeline } from '../../../packages/ui/src/timeline/index.js';

	let alertDismissals = $state(0);
	let listActivations = $state(0);
</script>

<div data-testid="alert-dismissals">{alertDismissals}</div>

<Alert
	variant="warning"
	dismissible
	data-testid="alert-root"
	onDismiss={() => {
		alertDismissals += 1;
	}}
>
	{#snippet icon()}!{/snippet}
	{#snippet title()}Scheduled maintenance{/snippet}
	{#snippet description()}Expect a short deploy window after docs publish.{/snippet}
</Alert>

<div data-testid="list-activations">{listActivations}</div>

<List.Root dense disablePadding data-testid="list-root">
	<List.Subheader data-testid="list-subheader">Deployments</List.Subheader>
	<List.Item
		interactive
		data-testid="list-item-enabled"
		onclick={() => {
			listActivations += 1;
		}}
	>
		<List.ItemIcon data-testid="list-item-icon">1</List.ItemIcon>
		<List.ItemText data-testid="list-item-text-children">Ship docs update</List.ItemText>
	</List.Item>
	<List.Item
		interactive
		disabled
		data-testid="list-item-disabled"
		onclick={() => {
			listActivations += 1;
		}}
	>
		<List.ItemIcon>2</List.ItemIcon>
		<List.ItemText data-testid="list-item-text-snippets">
			{#snippet primary()}Rollback window{/snippet}
			{#snippet secondary()}Disabled until checks pass{/snippet}
		</List.ItemText>
	</List.Item>
</List.Root>

<Table.Root data-testid="table-root">
	<Table.Caption data-testid="table-caption">Recent package checks</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Package</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head>Duration</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<Table.Row>
			<Table.Cell>@dryui/ui</Table.Cell>
			<Table.Cell>passed</Table.Cell>
			<Table.Cell>18s</Table.Cell>
		</Table.Row>
		<Table.Row>
			<Table.Cell>@dryui/mcp</Table.Cell>
			<Table.Cell>passed</Table.Cell>
			<Table.Cell>11s</Table.Cell>
		</Table.Row>
	</Table.Body>
	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>2 suites</Table.Cell>
			<Table.Cell>29s</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>

<Timeline.Root orientation="horizontal" data-testid="timeline-root">
	<Timeline.Item data-testid="timeline-item-first">
		<Timeline.Icon data-testid="timeline-icon-filled">1</Timeline.Icon>
		<Timeline.Content>
			<Timeline.Time data-testid="timeline-time" datetime="2026-04-12">Today</Timeline.Time>
			<Timeline.Title data-testid="timeline-title">Coverage scripts added</Timeline.Title>
			<Timeline.Description data-testid="timeline-description">
				Browser and unit coverage entrypoints now run together.
			</Timeline.Description>
		</Timeline.Content>
	</Timeline.Item>
	<Timeline.Item data-testid="timeline-item-second">
		<Timeline.Icon data-testid="timeline-icon-empty" />
		<Timeline.Content>
			<Timeline.Title>Contract test updated</Timeline.Title>
		</Timeline.Content>
	</Timeline.Item>
</Timeline.Root>
