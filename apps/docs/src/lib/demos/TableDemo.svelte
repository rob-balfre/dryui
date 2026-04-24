<script lang="ts">
	import { Badge, Table } from '@dryui/ui';

	const deploys = [
		{ env: 'production', sha: 'a3f2c91', author: 'rianne', status: 'live', when: '4m ago' },
		{ env: 'staging', sha: '8b7e044', author: 'marco', status: 'live', when: '28m ago' },
		{ env: 'preview-214', sha: 'c4d1920', author: 'priya', status: 'building', when: '1m ago' },
		{ env: 'production', sha: '5fa8b01', author: 'rianne', status: 'rolled back', when: '2h ago' }
	] as const;

	function badgeColor(status: string) {
		if (status === 'live') return 'green';
		if (status === 'building') return 'blue';
		return 'red';
	}
</script>

<Table.Root>
	<Table.Caption>Recent deploys across environments</Table.Caption>
	<Table.Header>
		<Table.Row>
			<Table.Head>Environment</Table.Head>
			<Table.Head>Commit</Table.Head>
			<Table.Head>Author</Table.Head>
			<Table.Head>Status</Table.Head>
			<Table.Head>When</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each deploys as deploy (deploy.sha + deploy.env)}
			<Table.Row>
				<Table.Cell>{deploy.env}</Table.Cell>
				<Table.Cell><code>{deploy.sha}</code></Table.Cell>
				<Table.Cell>@{deploy.author}</Table.Cell>
				<Table.Cell>
					<Badge variant="soft" color={badgeColor(deploy.status)}>{deploy.status}</Badge>
				</Table.Cell>
				<Table.Cell>{deploy.when}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<style>
	code {
		font-family: var(--dry-font-mono);
		font-size: var(--dry-text-sm-size);
		color: var(--dry-color-text-strong);
	}
</style>
