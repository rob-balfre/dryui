<script lang="ts">
	import { Badge } from '@dryui/ui/badge';
	import { Table } from '@dryui/ui/table';
	import { Text } from '@dryui/ui/text';

	interface Props {
		vars: Record<string, string>;
	}

	let { vars }: Props = $props();
</script>

<Table.Root>
	<Table.Header>
		<Table.Row>
			<Table.Head scope="col">Variable</Table.Head>
			<Table.Head scope="col">Description</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each Object.entries(vars) as [name, description] (name)}
			<Table.Row>
				<Table.Cell>
					<Badge variant="soft" color="gray" size="sm"><code>{name}</code></Badge>
				</Table.Cell>
				<Table.Cell>
					<Text as="span" color="secondary" size="sm">{description}</Text>
				</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>

<style>
</style>
