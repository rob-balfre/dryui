<script lang="ts">
	import { DataGrid } from '@dryui/ui';

	type Row = { id: string; name: string; status: string; value: string };

	const rows: Row[] = [
		{ id: '1', name: 'Acme Co.', status: 'Paid', value: '$4,200' },
		{ id: '2', name: 'Northstar', status: 'Open', value: '$2,980' },
		{ id: '3', name: 'Orbit Labs', status: 'Past due', value: '$1,240' },
		{ id: '4', name: 'Mosaic', status: 'Paid', value: '$7,520' }
	];
</script>

<DataGrid.Root items={rows} pageSize={4}>
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
					<DataGrid.Row rowId={row.id}>
						<DataGrid.Cell>{row.name}</DataGrid.Cell>
						<DataGrid.Cell>{row.status}</DataGrid.Cell>
						<DataGrid.Cell>{row.value}</DataGrid.Cell>
					</DataGrid.Row>
				{/each}
			{/snippet}
		</DataGrid.Body>
	</DataGrid.Table>
	<DataGrid.Pagination />
</DataGrid.Root>
