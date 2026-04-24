<script lang="ts">
	import { Badge, DataGrid } from '@dryui/ui';

	type Account = {
		id: number;
		name: string;
		plan: 'Starter' | 'Growth' | 'Enterprise';
		seats: number;
		mrr: number;
		status: 'Active' | 'Trial' | 'Paused';
	};

	const accounts: Account[] = [
		{ id: 1, name: 'Northstar', plan: 'Enterprise', seats: 240, mrr: 4200, status: 'Active' },
		{ id: 2, name: 'Orbit Labs', plan: 'Growth', seats: 48, mrr: 2180, status: 'Trial' },
		{ id: 3, name: 'Mosaic', plan: 'Starter', seats: 12, mrr: 480, status: 'Paused' },
		{ id: 4, name: 'Signal Works', plan: 'Enterprise', seats: 312, mrr: 3610, status: 'Active' },
		{ id: 5, name: 'Glasshouse', plan: 'Growth', seats: 64, mrr: 1820, status: 'Active' },
		{ id: 6, name: 'Parallel', plan: 'Starter', seats: 8, mrr: 290, status: 'Trial' },
		{ id: 7, name: 'Beacon', plan: 'Growth', seats: 36, mrr: 1290, status: 'Active' }
	];

	const statusColor = { Active: 'green', Trial: 'blue', Paused: 'red' } as const;
	const planColor = { Enterprise: 'purple', Growth: 'blue', Starter: 'gray' } as const;
	const currency = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	});
</script>

<DataGrid.Root items={accounts} pageSize={4} striped>
	<DataGrid.Table>
		<DataGrid.Header>
			<DataGrid.Row>
				<DataGrid.Column key="name" sortable>Account</DataGrid.Column>
				<DataGrid.Column key="plan" sortable>Plan</DataGrid.Column>
				<DataGrid.Column key="seats" sortable>Seats</DataGrid.Column>
				<DataGrid.Column key="mrr" sortable>MRR</DataGrid.Column>
				<DataGrid.Column key="status">Status</DataGrid.Column>
			</DataGrid.Row>
		</DataGrid.Header>

		<DataGrid.Body>
			{#snippet children({ items })}
				{@const rows = items as Account[]}
				{#each rows as account (account.id)}
					<DataGrid.Row>
						<DataGrid.Cell>{account.name}</DataGrid.Cell>
						<DataGrid.Cell>
							<Badge variant="outline" color={planColor[account.plan]}>{account.plan}</Badge>
						</DataGrid.Cell>
						<DataGrid.Cell><span class="num">{account.seats}</span></DataGrid.Cell>
						<DataGrid.Cell><span class="num">{currency.format(account.mrr)}</span></DataGrid.Cell>
						<DataGrid.Cell>
							<Badge variant="soft" color={statusColor[account.status]}>{account.status}</Badge>
						</DataGrid.Cell>
					</DataGrid.Row>
				{/each}
			{/snippet}
		</DataGrid.Body>
	</DataGrid.Table>

	<DataGrid.Pagination />
</DataGrid.Root>

<style>
	.num {
		font-family: var(--dry-font-mono);
		font-variant-numeric: tabular-nums;
		color: var(--dry-color-text-strong);
	}
</style>
