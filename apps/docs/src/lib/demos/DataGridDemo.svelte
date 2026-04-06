<script lang="ts">
	import { Badge, DataGrid } from '@dryui/ui';

	type Account = {
		id: number;
		name: string;
		status: 'Active' | 'Review' | 'Paused';
		revenue: string;
	};

	const accounts: Account[] = [
		{ id: 1, name: 'Northstar', status: 'Active', revenue: '$4,200' },
		{ id: 2, name: 'Orbit Labs', status: 'Review', revenue: '$2,180' },
		{ id: 3, name: 'Mosaic', status: 'Paused', revenue: '$980' },
		{ id: 4, name: 'Signal Works', status: 'Active', revenue: '$3,610' }
	];
</script>

<DataGrid.Root items={accounts} pageSize={3} striped>
	<DataGrid.Table>
		<DataGrid.Header>
			<DataGrid.Row>
				<DataGrid.Column key="name" sortable>Customer</DataGrid.Column>
				<DataGrid.Column key="status">Status</DataGrid.Column>
				<DataGrid.Column key="revenue" sortable>Revenue</DataGrid.Column>
			</DataGrid.Row>
		</DataGrid.Header>

		<DataGrid.Body>
			{#snippet children({ items })}
				{@const rows = items as Account[]}
				{#each rows as account (account.id)}
					<DataGrid.Row>
						<DataGrid.Cell>{account.name}</DataGrid.Cell>
						<DataGrid.Cell>
							<Badge
								variant={account.status === 'Review' ? 'outline' : 'soft'}
								color={account.status === 'Active'
									? 'green'
									: account.status === 'Paused'
										? 'red'
										: 'blue'}
							>
								{account.status}
							</Badge>
						</DataGrid.Cell>
						<DataGrid.Cell>{account.revenue}</DataGrid.Cell>
					</DataGrid.Row>
				{/each}
			{/snippet}
		</DataGrid.Body>
	</DataGrid.Table>

	<DataGrid.Pagination />
</DataGrid.Root>
