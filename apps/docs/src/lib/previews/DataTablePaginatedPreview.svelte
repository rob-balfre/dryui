<script lang="ts">
	import { Badge, Button, Card, Combobox, DataGrid, Input, Text } from '@dryui/ui';

	type Row = {
		id: number;
		name: string;
		status: 'Paid' | 'Open' | 'Past due';
		value: string;
	};

	const rows: Row[] = [
		{ id: 1, name: 'Acme Co.', status: 'Paid', value: '$4,200' },
		{ id: 2, name: 'Northstar', status: 'Open', value: '$2,980' },
		{ id: 3, name: 'Orbit Labs', status: 'Past due', value: '$1,240' },
		{ id: 4, name: 'Mosaic', status: 'Paid', value: '$7,520' },
		{ id: 5, name: 'Vertex', status: 'Open', value: '$960' },
		{ id: 6, name: 'Signal Works', status: 'Paid', value: '$3,610' },
		{ id: 7, name: 'Nimbus', status: 'Open', value: '$1,890' },
		{ id: 8, name: 'Lumen', status: 'Past due', value: '$640' }
	];

	const assignees = [
		{ value: 'alex', label: 'Alex' },
		{ value: 'sam', label: 'Sam' },
		{ value: 'mia', label: 'Mia' }
	];

	let assignee = $state('alex');
	let query = $state('');
</script>

<div class="preview">
	<div class="stack-lg">
		<div class="stack-md">
			<Badge variant="soft">Data table</Badge>
			<Text as="p" color="muted">
				Pagination added — table stays dense, controls hug the footer.
			</Text>
		</div>

		<Card.Root>
			<Card.Content>
				<div class="stack-md">
					<div class="filters">
						<Input bind:value={query} placeholder="Search invoices..." />

						<Combobox.Root bind:value={assignee} name="assignee-paginated">
							<Combobox.Input aria-label="Assignee" placeholder="Filter by owner..." />
							<Combobox.Content>
								{#each assignees as person, index (person.value)}
									<Combobox.Item value={person.value} {index}>
										{person.label}
									</Combobox.Item>
								{/each}
							</Combobox.Content>
						</Combobox.Root>
					</div>

					<DataGrid.Root items={rows} pageSize={4} striped>
						<DataGrid.Table>
							<DataGrid.Header>
								<DataGrid.Row>
									<DataGrid.Column key="name" sortable>Customer</DataGrid.Column>
									<DataGrid.Column key="status">Status</DataGrid.Column>
									<DataGrid.Column key="value" sortable>Value</DataGrid.Column>
								</DataGrid.Row>
							</DataGrid.Header>

							<DataGrid.Body>
								{#snippet children({ items })}
									{@const currentRows = items as Row[]}
									{#each currentRows as row (row.id)}
										<DataGrid.Row>
											<DataGrid.Cell>{row.name}</DataGrid.Cell>
											<DataGrid.Cell>
												<Badge
													variant={row.status === 'Open' ? 'outline' : 'soft'}
													color={row.status === 'Paid'
														? 'green'
														: row.status === 'Past due'
															? 'red'
															: 'blue'}
												>
													{row.status}
												</Badge>
											</DataGrid.Cell>
											<DataGrid.Cell>{row.value}</DataGrid.Cell>
										</DataGrid.Row>
									{/each}
								{/snippet}
							</DataGrid.Body>
						</DataGrid.Table>

						<DataGrid.Pagination>
							{#snippet children({ page, totalPages, canPrevious, canNext, previous, next })}
								<div class="pagination-bar">
									<Text as="span" color="muted">Page {page} of {totalPages}</Text>
									<div class="pagination-actions">
										<Button variant="outline" size="sm" onclick={previous} disabled={!canPrevious}>
											Prev
										</Button>
										<Button variant="outline" size="sm" onclick={next} disabled={!canNext}>
											Next
										</Button>
									</div>
								</div>
							{/snippet}
						</DataGrid.Pagination>
					</DataGrid.Root>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

<style>
	.preview {
		container-type: inline-size;
		padding: var(--dry-space-5);
		background: var(--dry-color-bg-raised);
	}

	.filters {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--dry-space-3);
	}

	.pagination-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-4);
	}

	.pagination-actions {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
	}

	@container (max-width: 700px) {
		.filters {
			grid-template-columns: 1fr;
		}
	}
</style>
